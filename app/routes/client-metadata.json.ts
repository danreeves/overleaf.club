import type { Route } from "./+types/client-metadata.json"

export async function loader({ context }: Route.LoaderArgs) {
  return Response.json(context.client.clientMetadata)
}
