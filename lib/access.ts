import type { UserRole } from '@prisma/client';

export type AdminTabId =
  | 'overview'
  | 'products'
  | 'orders'
  | 'studio'
  | 'reviews'
  | 'support'
  | 'newsletter'
  | 'content'
  | 'automation'
  | 'security';

export type PermissionKey =
  | 'admin.access'
  | 'orders.read'
  | 'orders.manage'
  | 'delivery.read'
  | 'delivery.manage'
  | 'products.read'
  | 'products.manage'
  | 'content.read'
  | 'content.manage'
  | 'reviews.read'
  | 'reviews.manage'
  | 'newsletter.read'
  | 'newsletter.manage'
  | 'support.read'
  | 'support.manage'
  | 'studio.read'
  | 'studio.manage'
  | 'analytics.read'
  | 'security.read'
  | 'security.manage'
  | 'roles.manage'
  | 'automation.read'
  | 'automation.manage'
  | 'exports.read'
  | 'exports.manage';

type RoleConfig = {
  permissions: PermissionKey[];
  tabs: AdminTabId[];
};

const ALL_ADMIN_TABS: AdminTabId[] = [
  'overview',
  'products',
  'orders',
  'studio',
  'reviews',
  'support',
  'newsletter',
  'content',
  'automation',
  'security',
];

const ALL_PERMISSIONS: PermissionKey[] = [
  'admin.access',
  'orders.read',
  'orders.manage',
  'delivery.read',
  'delivery.manage',
  'products.read',
  'products.manage',
  'content.read',
  'content.manage',
  'reviews.read',
  'reviews.manage',
  'newsletter.read',
  'newsletter.manage',
  'support.read',
  'support.manage',
  'studio.read',
  'studio.manage',
  'analytics.read',
  'security.read',
  'security.manage',
  'roles.manage',
  'automation.read',
  'automation.manage',
  'exports.read',
  'exports.manage',
];

export const roleConfig: Record<UserRole, RoleConfig> = {
  CUSTOMER: {
    permissions: [],
    tabs: [],
  },
  SUPER_ADMIN: {
    permissions: ALL_PERMISSIONS,
    tabs: ALL_ADMIN_TABS,
  },
  OPERATIONS_ADMIN: {
    permissions: [
      'admin.access',
      'orders.read',
      'orders.manage',
      'delivery.read',
      'delivery.manage',
      'products.read',
      'support.read',
      'support.manage',
      'studio.read',
      'studio.manage',
      'analytics.read',
      'automation.read',
      'automation.manage',
      'exports.read',
      'exports.manage',
    ],
    tabs: ['overview', 'orders', 'studio', 'support', 'automation'],
  },
  DELIVERY_ADMIN: {
    permissions: [
      'admin.access',
      'orders.read',
      'orders.manage',
      'delivery.read',
      'delivery.manage',
      'support.read',
      'automation.read',
    ],
    tabs: ['overview', 'orders', 'support'],
  },
  CONTENT_ADMIN: {
    permissions: [
      'admin.access',
      'products.read',
      'products.manage',
      'content.read',
      'content.manage',
      'reviews.read',
      'reviews.manage',
      'newsletter.read',
      'newsletter.manage',
      'analytics.read',
    ],
    tabs: ['overview', 'products', 'reviews', 'newsletter', 'content'],
  },
  SUPPORT_ADMIN: {
    permissions: [
      'admin.access',
      'orders.read',
      'delivery.read',
      'support.read',
      'support.manage',
      'studio.read',
      'studio.manage',
      'newsletter.read',
      'analytics.read',
    ],
    tabs: ['overview', 'orders', 'studio', 'support', 'newsletter'],
  },
  ANALYST: {
    permissions: ['admin.access', 'analytics.read', 'exports.read', 'newsletter.read'],
    tabs: ['overview', 'newsletter'],
  },
};

export function normalizeUserRole(
  role: UserRole | null | undefined,
  isAdmin: boolean | null | undefined
): UserRole {
  if (role && role !== 'CUSTOMER') {
    return role;
  }

  if (isAdmin) {
    return 'SUPER_ADMIN';
  }

  return 'CUSTOMER';
}

export function isAdminRole(role: UserRole | null | undefined) {
  return normalizeUserRole(role, false) !== 'CUSTOMER';
}

export function getRolePermissions(role: UserRole | null | undefined) {
  const resolvedRole = normalizeUserRole(role, false);
  return roleConfig[resolvedRole]?.permissions || [];
}

export function getAllowedAdminTabs(role: UserRole | null | undefined) {
  const resolvedRole = normalizeUserRole(role, false);
  return roleConfig[resolvedRole]?.tabs || [];
}

export function hasPermission(
  role: UserRole | null | undefined,
  permission: PermissionKey
) {
  return getRolePermissions(role).includes(permission);
}

export function canAccessAdminTab(
  role: UserRole | null | undefined,
  tab: AdminTabId
) {
  return getAllowedAdminTabs(role).includes(tab);
}
