import { redirect } from "react-router"
import type { Route } from "./+types/callback"

export async function loader({ context, request }: Route.LoaderArgs) {
  const params = new URLSearchParams(request.url.split("?")[1])
  const session = await context.session.getSession(
    request.headers.get("Cookie"),
  )
  try {
    const result = await context.client.callback(params)
    session.set("did", result.session.did)
    return redirect("/", {
      headers: {
        "Set-Cookie": await context.session.commitSession(session),
      },
    })
  } catch (e) {
    session.flash("error", "Failed to authenticate")
  }
  return redirect("/login", {
    headers: { "Set-Cookie": await context.session.commitSession(session) },
  })
}
