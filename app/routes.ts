import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("client-metadata.json", "routes/client-metadata.json.ts"),
  route("jwks.json", "routes/jwks.json.ts"),
  route("oauth/callback", "routes/oauth/callback.ts"),
] satisfies RouteConfig
