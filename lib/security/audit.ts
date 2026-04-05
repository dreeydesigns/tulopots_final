import { createHash } from 'node:crypto';
import type {
  Prisma,
  SecurityEventType,
  SecuritySeverity,
  UserRole,
} from '@prisma/client';
import { isSchemaCompatibilityError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canAccessAdminTab, hasPermission, type AdminTabId, type PermissionKey } from '@/lib/access';

export function hashIdentifier(value: string | null | undefined) {
  const nextValue = String(value || '').trim().toLowerCase();

  if (!nextValue) {
    return null;
  }

  return createHash('sha256').update(nextValue).digest('hex');
}

export async function recordSecurityEvent(input: {
  type: SecurityEventType;
  severity: SecuritySeverity;
  route?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  identifier?: string | null;
  ip?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}) {
  try {
    return await prisma.securityEvent.create({
      data: {
        type: input.type,
        severity: input.severity,
        route: input.route || null,
        userId: input.userId || null,
        sessionId: input.sessionId || null,
        identifier: input.identifier || null,
        ipHash: hashIdentifier(input.ip),
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return null;
    }
    throw error;
  }
}

export async function recordLoginAttempt(input: {
  identifier: string;
  ip?: string | null;
  userId?: string | null;
  wasSuccessful: boolean;
  failureReason?: string | null;
  lockoutUntil?: Date | null;
}) {
  try {
    return await prisma.loginAttempt.create({
      data: {
        identifier: input.identifier.toLowerCase(),
        ipHash: hashIdentifier(input.ip) || 'unknown',
        userId: input.userId || null,
        wasSuccessful: input.wasSuccessful,
        failureReason: input.failureReason || null,
        lockoutUntil: input.lockoutUntil || null,
      },
    });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return null;
    }
    throw error;
  }
}

export async function recordAdminAudit(input: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  diffJson?: Prisma.InputJsonValue | null;
}) {
  try {
    return await prisma.adminAuditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId || null,
        summary: input.summary,
        diffJson: input.diffJson ?? undefined,
      },
    });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return null;
    }
    throw error;
  }
}

export function assertPermission(role: UserRole | null | undefined, permission: PermissionKey) {
  return hasPermission(role, permission);
}

export function assertAdminTab(role: UserRole | null | undefined, tab: AdminTabId) {
  return canAccessAdminTab(role, tab);
}
