import type {
  AutomationJob,
  AutomationJobStatus,
  AutomationJobType,
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function queueAutomationJob(input: {
  type: AutomationJobType;
  dedupeKey?: string | null;
  runAt?: Date;
  payloadJson: Prisma.InputJsonValue;
}) {
  if (input.dedupeKey) {
    const existing = await prisma.automationJob.findUnique({
      where: { dedupeKey: input.dedupeKey },
    });

    if (existing && ['PENDING', 'PROCESSING', 'COMPLETED'].includes(existing.status)) {
      return existing;
    }
  }

  return prisma.automationJob.create({
    data: {
      type: input.type,
      dedupeKey: input.dedupeKey || null,
      runAt: input.runAt || new Date(),
      payloadJson: input.payloadJson,
    },
  });
}

export async function completeAutomationJob(jobId: string) {
  return prisma.automationJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export async function failAutomationJob(jobId: string, error: string) {
  return prisma.automationJob.update({
    where: { id: jobId },
    data: {
      status: 'FAILED',
      lastError: error,
      lockedAt: null,
      lockedBy: null,
      attempts: {
        increment: 1,
      },
    },
  });
}

export async function markAutomationJobProcessing(jobId: string, lockedBy: string) {
  return prisma.automationJob.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      lockedAt: new Date(),
      lockedBy,
      attempts: {
        increment: 1,
      },
    },
  });
}

export async function getDueAutomationJobs(limit = 50) {
  return prisma.automationJob.findMany({
    where: {
      status: 'PENDING',
      runAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      runAt: 'asc',
    },
    take: limit,
  });
}

export async function recordNotificationAttempt(input: {
  jobId?: string | null;
  userId?: string | null;
  templateKey?: string | null;
  channel: NotificationChannel;
  destination: string;
  provider: string;
  status: NotificationStatus;
  payloadJson?: Prisma.InputJsonValue;
  providerResponseJson?: Prisma.InputJsonValue;
  error?: string | null;
  sentAt?: Date | null;
}) {
  return prisma.notificationAttempt.create({
    data: {
      jobId: input.jobId || null,
      userId: input.userId || null,
      templateKey: input.templateKey || null,
      channel: input.channel,
      destination: input.destination,
      provider: input.provider,
      status: input.status,
      payloadJson: input.payloadJson ?? undefined,
      providerResponseJson: input.providerResponseJson ?? undefined,
      error: input.error || null,
      sentAt: input.sentAt || null,
    },
  });
}

export async function ensureNotificationTemplate(input: {
  key: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variablesJson?: Prisma.InputJsonValue;
}) {
  return prisma.notificationTemplate.upsert({
    where: { key: input.key },
    update: {
      channel: input.channel,
      subject: input.subject,
      body: input.body,
      variablesJson: input.variablesJson ?? undefined,
      enabled: true,
    },
    create: {
      key: input.key,
      channel: input.channel,
      subject: input.subject,
      body: input.body,
      variablesJson: input.variablesJson ?? undefined,
    },
  });
}
