export const USER_ROLES = [
  'admin',
  'finance',
  'reservations',
  'operations',
  'recovery',
  'management',
  'executive',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'System Administrator',
  finance: 'Finance Department',
  reservations: 'Reservations Team',
  operations: 'Operations Team',
  recovery: 'Recovery Officers',
  management: 'Management',
  executive: 'Executive Users',
}

/** Roles whose permissions can be edited in the Roles UI (admin always has full access). */
export const MANAGEABLE_ROLES: UserRole[] = [
  'finance',
  'reservations',
  'operations',
  'recovery',
  'management',
  'executive',
]

/** Roles that must be assigned to a branch/office. */
export const BRANCH_REQUIRED_ROLES: UserRole[] = ['reservations', 'operations', 'recovery']

export function requiresBranch(role: UserRole) {
  return BRANCH_REQUIRED_ROLES.includes(role)
}

export function isManageableRole(role: UserRole) {
  return MANAGEABLE_ROLES.includes(role)
}
