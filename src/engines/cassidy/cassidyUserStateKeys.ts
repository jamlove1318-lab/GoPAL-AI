export const CASSIDY_HOME_WORLD_ID = 'emerald-valley' as const;
export const CASSIDY_LOCAL_USER_ID = 'local-explorer-user' as const;

export function normalizeCassidyUserId(userId?: string): string {
  return userId?.trim() || CASSIDY_LOCAL_USER_ID;
}

export function cassidyUserKey(namespace: string, userId?: string): string {
  return `cassidy:${namespace}:v1:${normalizeCassidyUserId(userId)}`;
}
