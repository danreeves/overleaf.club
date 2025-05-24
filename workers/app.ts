import "./patches"
import type { OAuthClient } from "@atproto/oauth-client"
import { createRequestHandler } from "react-router"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { getClient } from "~/server/oauth-client.server"
import { createSessionStorage } from "~/server/session.server"

declare module "react-router" {
  export interface AppLoadContext {
    env: Env
    ctx: ExecutionContext
    db: DrizzleD1Database
    client: OAuthClient
    session: ReturnType<typeof createSessionStorage>
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const host = url.protocol + "//" + url.host
    const db = drizzle(env.DB)
    const client = await getClient(host, env, db)
    const session = createSessionStorage(env, url.host)
    return requestHandler(request, {
      env,
      ctx,
      db,
      client,
      session,
    })
  },
} satisfies ExportedHandler<Env>
