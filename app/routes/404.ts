export async function loader() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
