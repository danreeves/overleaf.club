import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"

import type { Route } from "./+types/root"
import "./app.css"
import { Agent } from "@atproto/api"
import logo from "./assets/logo.svg"
import "@fontsource-variable/vollkorn"

export const links: Route.LinksFunction = () => [{ rel: "icon", href: logo }]

export function meta() {
  return [{ title: "Overleaf Club" }]
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const session = await context.session.getSession(
    request.headers.get("Cookie"),
  )
  const did = session.get("did")
  if (did) {
    try {
      const oauthSession = await context.client.restore(did)
      const agent = oauthSession ? new Agent(oauthSession) : null
      const profile = await agent?.getProfile({ actor: did })
      if (!profile) {
        return undefined
      }

      return {
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
        banner: profile.data.banner,
        handle: profile.data.handle,
        description: profile.data.description,
        q,
      }
    } catch (e) {
      console.error("Failed to load profile:", e)
      return undefined
    }
  } else {
    return undefined
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 mb-4 w-full bg-ivory text-leaf font-serif py-2 px-4 flex justify-between items-center">
        <h1 className="text-4xl flex flex-row font-bold">
          <Link to="/" className="flex flex-row items-center gap-4">
            <img src={logo} alt="" className="h-12" />
            <span className="pt-2">Overleaf Club</span>
          </Link>
        </h1>
        <div className="flex flex-row gap-4">
          <Form method="GET" action="/search" className="flex items-center">
            <input
              type="search"
              name="q"
              placeholder="Search..."
              className="p-2 rounded border border-gray-300"
              defaultValue={loaderData?.q ?? ""}
            />
          </Form>
          {loaderData ? (
            <div className="flex items-center gap-2">
              <Link to={`/@${loaderData.handle}`}>
                <img
                  popover-target="profile-popover"
                  popover-target-action="show"
                  src={loaderData.avatar}
                  alt={`Avatar of ${loaderData.displayName} (@${loaderData.handle})`}
                  title={`@${loaderData.handle}`}
                  className="w-12 h-12 rounded-full mr-2"
                />
              </Link>
            </div>
          ) : (
            <p>You are not logged in.</p>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
