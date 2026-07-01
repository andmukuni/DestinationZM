export const CLIENT_ACCOUNT_ROLES = ['owner', 'admin', 'member'] as const

export type ClientAccountRole = (typeof CLIENT_ACCOUNT_ROLES)[number]

export const CLIENT_ACCOUNT_ROLE_LABELS: Record<ClientAccountRole, string> = {
  owner: 'Organization owner',
  admin: 'Administrator',
  member: 'Member',
}
