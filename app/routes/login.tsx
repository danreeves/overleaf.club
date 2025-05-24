import { Form, redirect } from "react-router"
import type { Route } from "./+types/login"

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData()
  const handle = formData.get("handle")
  if (typeof handle !== "string" || !handle) {
    return { error: "Handle is required" }
  }
  const url = await context.client.authorize(handle, {
    scope: "atproto transition:generic",
  })

  return redirect(url.toString())
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <Form
        method="post"
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <h1 className="text-4xl font-bold mb-4 font-serif text-leaf">Login</h1>
        <input
          type="text"
          name="handle"
          placeholder="Enter your handle"
          className="border border-gray-300 p-2 mb-4"
        />
        <button
          type="submit"
          className="bg-leaf text-white p-2 rounded cursor-pointer"
        >
          Login
        </button>
        {actionData?.error && (
          <p className="text-red-500 mt-2">{actionData.error}</p>
        )}
      </Form>
    </div>
  )
}
