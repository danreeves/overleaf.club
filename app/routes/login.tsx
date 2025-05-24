import { Form, redirect } from "react-router"
import type { Route } from "./+types/login"

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData()
  let handle = formData.get("handle")
  if (typeof handle !== "string" || !handle) {
    return { error: "Handle is required" }
  }
  if (handle.startsWith("@")) {
    handle = handle.slice(1) // Remove leading @ if present
  }
  const url = await context.client.authorize(handle, {
    scope: "atproto transition:generic",
  })

  return redirect(url.toString())
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 font-serif text-leaf">Login</h1>
        <p className="text-gray-700 mb-6 text-center">
          Sign in with your{" "}
          <span className="font-semibold">atproto/Bluesky</span> handle.
          <br />
          We use the official Bluesky authentication flow to securely sign you
          in.
        </p>
        <Form method="post" className="w-full flex flex-col items-center">
          <input
            type="text"
            name="handle"
            placeholder="Enter your handle, e.g. @overleaf.club"
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-leaf"
          />
          <button
            type="submit"
            className="bg-leaf hover:bg-leaf-dark transition-colors text-white font-semibold p-3 rounded w-full mb-2 shadow"
          >
            Log in with Bluesky
          </button>
          {actionData?.error && (
            <p className="text-red-500 mt-2 text-center w-full">
              {actionData.error}
            </p>
          )}
        </Form>
      </div>
    </div>
  )
}
