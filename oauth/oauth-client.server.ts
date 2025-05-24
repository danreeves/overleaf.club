import { OAuthClient } from "@atproto/oauth-client"
import type { InternalStateData, Key, Session } from "@atproto/oauth-client"
import { JoseKey } from "@atproto/jwk-jose"
import type { DrizzleD1Database } from "drizzle-orm/d1"
import { authSession, authState } from "database/schema"
import { eq } from "drizzle-orm/sqlite-core/expressions"

export async function getClient(
  host: string,
  env: Env,
  db: DrizzleD1Database,
): Promise<OAuthClient> {
  const isLocal =
    host.startsWith("http://localhost") ||
    host.startsWith("http://127.0.0.1") ||
    host.startsWith("http://[::1]")

  const client = new OAuthClient({
    handleResolver: "https://bsky.social", // backend instances should use a DNS based resolver
    responseMode: "query",

    clientMetadata: {
      client_id: isLocal
        ? `http://localhost?scope=${encodeURI("atproto transition:generic")}&redirect_uri=${encodeURI("http://[::1]/oauth/callback")}`
        : `${host}/client-metadata.json`,
      jwks_uri: `${host}/jwks.json`,
      redirect_uris: isLocal
        ? ["http://[::1]/oauth/callback"]
        : [`${host}/oauth/callback`],

      token_endpoint_auth_signing_alg: "ES256",
      scope: "atproto transition:generic",
      client_name: "Overleaf.Club Auth",
      client_uri: host,
      logo_uri: `${host}/logo.png`,
      tos_uri: `${host}/tos`,
      policy_uri: `${host}/policy`,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "private_key_jwt",
      dpop_bound_access_tokens: true,
    },

    runtimeImplementation: {
      createKey(algs: string[]): Promise<Key> {
        return JoseKey.generate(algs)
      },

      getRandomValues(length: number): Uint8Array | PromiseLike<Uint8Array> {
        return crypto.getRandomValues(new Uint8Array(length))
      },

      async digest(
        bytes: Uint8Array,
        algorithm: { name: string },
      ): Promise<Uint8Array> {
        if (algorithm.name.startsWith("sha")) {
          const subtleAlgo = `SHA-${algorithm.name.slice(3)}`
          const buffer = await crypto.subtle.digest(subtleAlgo, bytes)
          return new Uint8Array(buffer)
        }

        throw new TypeError(`Unsupported algorithm: ${algorithm.name}`)
      },

      // TODO!!!!!!!!
      //   requestLock: <T>(
      //     name: string,
      //     fn: () => T | PromiseLike<T>,
      //   ): Promise<T> => {
      //     // This function is used to prevent concurrent refreshes of the same
      //     // credentials. It is important to ensure that only one refresh is done at
      //     // a time to prevent the sessions from being revoked.

      //     // The following example shows a simple in-memory lock. In a real
      //     // application, you should use a more robust solution (e.g. a system wide
      //     // lock manager). Note that not providing a lock will result in an
      //     // in-memory lock to be used (DO NOT copy-paste the following code).

      //     declare const locks: Map<string, Promise<void>>

      //     const current = locks.get(name) || Promise.resolve()
      //     const next = current
      //       .then(fn)
      //       .catch(() => {})
      //       .finally(() => {
      //         if (locks.get(name) === next) locks.delete(name)
      //       })

      //     locks.set(name, next)
      //     return next
      //   },
    },

    stateStore: {
      async set(key: string, internalState: InternalStateData): Promise<void> {
        const serializedState = {
          ...internalState,
          dpopKey: internalState.dpopKey.privateJwk,
        }
        await db
          .insert(authState)
          .values({ key, state: JSON.stringify(serializedState) })
          .onConflictDoUpdate({
            target: authState.key,
            set: { state: JSON.stringify(serializedState) },
          })
        return
      },

      async get(key: string): Promise<InternalStateData | undefined> {
        const rows = await db
          .select()
          .from(authState)
          .where(eq(authState.key, key))
        if (rows.length === 0) return undefined
        const row = rows[0]
        const serializedResult = JSON.parse(row.state)
        const result = {
          ...serializedResult,
          dpopKey: await JoseKey.fromJWK(serializedResult.dpopKey),
        }
        return result
      },

      async del(key: string): Promise<void> {
        await db.delete(authState).where(eq(authState.key, key))
        return
      },
    },

    sessionStore: {
      async set(key: string, session: Session): Promise<void> {
        const keyToSerialize = session.dpopKey.privateJwk
        const serializeableSession = {
          ...session,
          dpopKey: keyToSerialize,
        }
        await db
          .insert(authSession)
          .values({ key, session: JSON.stringify(serializeableSession) })
          .onConflictDoUpdate({
            target: authSession.key,
            set: { session: JSON.stringify(serializeableSession) },
          })
        return
      },

      async get(key: string): Promise<Session | undefined> {
        const rows = await db
          .select()
          .from(authSession)
          .where(eq(authSession.key, key))
        if (rows.length === 0) return undefined
        const row = rows[0]
        const deserializedSessions = JSON.parse(row.session)
        const session = {
          ...deserializedSessions,
          dpopKey: await JoseKey.fromJWK(deserializedSessions.dpopKey),
        }
        return session
      },

      async del(key: string): Promise<void> {
        await db.delete(authSession).where(eq(authSession.key, key))
      },
    },

    keyset: [
      await JoseKey.fromImportable(env.PRIVATE_KEY_1, "atprotokey.1"),
      await JoseKey.fromImportable(env.PRIVATE_KEY_2, "atprotokey.2"),
      await JoseKey.fromImportable(env.PRIVATE_KEY_3, "atprotokey.3"),
    ],
  })

  return client
}
