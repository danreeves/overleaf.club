import type { Route } from "./+types/jwks.json"

export async function loader({ context }: Route.LoaderArgs) {
  return Response.json(context.client.jwks)
}
