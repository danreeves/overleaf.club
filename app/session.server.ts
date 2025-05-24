import { createCookieSessionStorage } from "react-router"

type SessionData = {
  did: string
}

type SessionFlashData = {
  error: string
}

export function createSessionStorage(env: Env, domain: string) {
  const isLocal =
    domain === "localhost" || domain === "127.0.0.1" || domain === "[::1]"
  const defaultCookieOptions = {
    name: "__session",
    maxAge: 60 * 60 * 24 * 7 * 365, // 1 year
    sameSite: "lax" as const,
    secrets: [env.COOKIE_SECRET],
    path: "/",
    secure: true,
    httpOnly: true,
  }
  const deployedCookieOptions = {
    ...defaultCookieOptions,
    domain: domain,
  }
  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: isLocal ? defaultCookieOptions : deployedCookieOptions,
  })
}
