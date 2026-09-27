import { cookies } from 'next/headers'

const COOKIE_NAME = 'village_session'
const SECRET = process.env.SESSION_SECRET || 'change-me-in-env'

interface SessionData {
  id: number
  code: string
  full_name: string | null
  role: string
}

export async function createSession(data: SessionData): Promise<string> {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const crypto = await import('crypto')
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url')
  return `${payload}.${sig}`
}

export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const crypto = await import('crypto')
    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64url')
    if (expected !== sig) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export const SESSION_COOKIE = COOKIE_NAME