import type { Route } from "./+types/login"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export async function loader({ context }: Route.LoaderArgs) {
  const url = await context.client.authorize("danreev.es", {
    scope: "atproto transition:generic",
  })

  return {
    authorizeUrl: url.toString(),
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <a href={loaderData.authorizeUrl}>Authorize URL</a>
    </div>
  )
}
