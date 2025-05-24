import type { Route } from "./+types/book"
import {
  WorkSchema,
  EditionsSchema,
  AuthorSchema,
} from "../openlibrary/schemas"

export async function loader({ params }: Route.LoaderArgs) {
  const response = await fetch(
    `https://openlibrary.org/works/${params.key}.json`,
  )

  const work = WorkSchema.parse(await response.json())

  const editionsResponse = await fetch(
    `https://openlibrary.org/works/${params.key}/editions.json`,
  )
  const editions = EditionsSchema.parse(await editionsResponse.json())
  const authors = await Promise.all(
    work.authors.map(async (a: any) => {
      const authorResponse = await fetch(
        `https://openlibrary.org${a.author.key}.json`,
      )
      return AuthorSchema.parse(await authorResponse.json())
    }),
  )

  return { work, editions, authors }
}

export default function Book({ loaderData }: Route.ComponentProps) {
  const { work, editions, authors } = loaderData

  return (
    <div className="w-6xl mx-auto p-4">
      <div className="flex flex-row gap-4">
        <div className="w-64 h-96 relative group">
          {work.covers && work.covers.length > 0 ? (
            work.covers
              .slice()
              .reverse()
              .map((coverId, i, arr) => (
                <img
                  className="rounded w-64 h-96 absolute transition-transform duration-300 group-hover:[transform:rotate(var(--rotate,0deg))] origin-bottom-right scale-[var(--scale,1)]"
                  style={
                    {
                      "--rotate": `${(arr.length - 1 - i) * 5 - 2}deg`,
                      "--scale": `${(arr.length - 1 - i) * -0.05 + 1}`,
                    } as React.CSSProperties
                  }
                  src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
                  alt={work.title}
                />
              ))
          ) : (
            <img
              className="rounded w-64 h-96 absolute"
              src="TODO: Placeholder image URL"
              alt=""
            />
          )}
        </div>
        <div className="flex flex-col w-xl">
          <h1 className="text-leaf text-3xl">{work.title}</h1>
          <div>by {authors.map((author) => author.name).join(", ")}</div>
          <div>Published {editions.entries[0].publish_date}</div>
          <div>{editions.entries[0].number_of_pages} pages</div>
          {work.description ? <p className="mt-4">{work.description}</p> : null}
        </div>
      </div>
    </div>
  )
}
