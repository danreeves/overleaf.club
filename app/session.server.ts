import { createCookieSessionStorage } from "react-router"

type SessionData = {
  did: string
}

type SessionFlashData = {
  error: string
}

export function createSessionStorage(env: Env, domain: string) {
  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      domain: domain,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [env.COOKIE_SECRET],
      secure: true,
      maxAge: 60 * 60 * 24 * 7 * 365, // 1 year
    },
  })
}
