import { Agent } from "@atproto/api"
import type { Route } from "./+types/home"

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.session.getSession(
    request.headers.get("Cookie"),
  )
  const did = session.get("did")
  if (did) {
    try {
      const oauthSession = await context.client.restore(did)
      const agent = oauthSession ? new Agent(oauthSession) : null
      const profile = await agent?.getProfile({ actor: did })
      return profile
    } catch (e) {
      console.error("Failed to load profile:", e)
      return undefined
    }
  } else {
    return undefined
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Home</h1>
      {loaderData ? (
        <>
          <p>Hello, {loaderData?.data.displayName}!</p>
          <img src={loaderData?.data.avatar} alt="Avatar" height={50} />
        </>
      ) : (
        <>
          <p>You are not logged in.</p>
          <p>
            <a href="/login">Login</a>
          </p>
        </>
      )}
    </div>
  )
}
