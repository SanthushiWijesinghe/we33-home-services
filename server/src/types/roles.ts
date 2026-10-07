export const ROLES = ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'] as const
export type UserRole = (typeof ROLES)[number]
