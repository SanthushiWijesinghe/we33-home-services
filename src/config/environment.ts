const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined

export const environment = {
  apiUrl: rawApiUrl?.replace(/\/+$/, '') ?? '',
} as const
