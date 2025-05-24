import { Link } from "react-router"
import type { Route } from "./+types/search"
import { fetcher } from "~/openlibrary/fetcher"

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q")
  if (!query) {
    return { results: [] }
  }

  const response = await fetcher(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,cover_i,title,subtitle,first_publish_year,cover_edition_key,author_name,isbn&limit=24`,
  )

  const data = await response.json()
  return { results: data }
}

export default function Search({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col w-6xl">
        <h1 className="text-4xl font-bold mb-4 font-serif">Search</h1>
        <p className="text-lg">This is the search page.</p>
        <p className="text-sm text-gray-500 mt-2">
          Use the search bar in the header to find content.
        </p>
        {loaderData.results && loaderData.results.docs ? (
          <ul className="mt-4 gap-4 flex flex-col">
            {loaderData.results.docs.map((doc) => (
              <li key={doc.key}>
                <Link
                  to={`/book/${doc.key.replace("/works/", "")}`}
                  className="text-blue-500"
                >
                  <img
                    src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`}
                    alt={doc.title}
                    className="w-32 h-48 mr-4 rounded inline-block"
                  />
                  {doc.title}
                  {doc.subtitle}
                  {doc.author_name ? (
                    <span className="text-sm text-gray-600">
                      {" by " + doc.author_name.join(", ")}
                    </span>
                  ) : null}
                </Link>
                <pre>{JSON.stringify(doc.editions, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4">No results found.</p>
        )}
      </div>
    </div>
  )
}
