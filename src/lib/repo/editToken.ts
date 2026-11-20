/** Owner edit tokens for Supabase mode. The token stays in this browser; the server stores only its SHA-256 hash. */
const TOKENS_KEY = 'homestead:v1:tokens'
const memory = new Map<string, string>()

const hex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

export function newToken(): string {
  return hex(crypto.getRandomValues(new Uint8Array(32)))
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return hex(new Uint8Array(digest))
}

function readAll(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? '{}') as Record<string, string> } catch { return {} }
}

export function saveToken(homesteadId: string, token: string): void {
  memory.set(homesteadId, token)
  try { localStorage.setItem(TOKENS_KEY, JSON.stringify({ ...readAll(), [homesteadId]: token })) } catch { /* memory copy lasts the session */ }
}

export function getToken(homesteadId: string): string | null {
  return readAll()[homesteadId] ?? memory.get(homesteadId) ?? null
}
