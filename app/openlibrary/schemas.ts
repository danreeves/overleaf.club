import { z } from "zod"

export const WorkSchema = z.object({
  title: z.string(),
  key: z.string(),
  authors: z.array(
    z.object({
      type: z.object({
        key: z.string(),
      }),
      author: z.object({
        key: z.string(),
      }),
    }),
  ),
  type: z.object({
    key: z.string(),
  }),
  description: z
    .union([
      z.object({
        type: z.string(),
        value: z.string(),
      }),
      z.string(),
    ])
    .optional()
    .transform((val) => {
      if (typeof val === "object" && "value" in val) {
        return val.value
      }
      if (typeof val === "string") {
        return val
      }
      return undefined
    }),
  covers: z.array(z.number()),
  subjects: z.array(z.string()),
  latest_revision: z.number(),
  revision: z.number(),
  created: z.object({
    type: z.string(),
    value: z.string(),
  }),
  last_modified: z.object({
    type: z.string(),
    value: z.string(),
  }),
})

export const EditionsSchema = z.object({
  links: z.object({
    self: z.string(),
    work: z.string(),
  }),
  size: z.number(),
  entries: z.array(
    z.object({
      type: z.object({ key: z.string() }).optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      full_title: z.string().optional(),
      authors: z.array(z.object({ key: z.string() })).optional(),
      publish_date: z.string().optional(),
      source_records: z.array(z.string()).optional(),
      publishers: z.array(z.string()).optional(),
      physical_format: z.string().optional(),
      notes: z
        .union([z.string(), z.object({ type: z.string(), value: z.string() })])
        .optional(),
      covers: z.array(z.number()).optional(),
      works: z.array(z.object({ key: z.string() })).optional(),
      key: z.string().optional(),
      identifiers: z.record(z.array(z.string())).optional(),
      isbn_10: z.array(z.string()).optional(),
      isbn_13: z.array(z.string()).optional(),
      classifications: z.record(z.any()).optional(),
      languages: z.array(z.object({ key: z.string() })).optional(),
      contributors: z
        .array(z.object({ role: z.string(), name: z.string() }))
        .optional(),
      latest_revision: z.number().optional(),
      revision: z.number().optional(),
      created: z.object({ type: z.string(), value: z.string() }).optional(),
      last_modified: z
        .object({ type: z.string(), value: z.string() })
        .optional(),
      number_of_pages: z.number().optional(),
      lc_classifications: z.array(z.string()).optional(),
      description: z
        .union([z.object({ type: z.string(), value: z.string() }), z.string()])
        .optional()
        .transform((val) => {
          if (typeof val === "object" && "value" in val) {
            return val.value
          }
          if (typeof val === "string") {
            return val
          }
          return undefined
        }),
      local_id: z.array(z.string()).optional(),
      edition_name: z.string().optional(),
      lccn: z.array(z.string()).optional(),
      subjects: z.array(z.string()).optional(),
      dewey_decimal_class: z.array(z.string()).optional(),
      publish_country: z.string().optional(),
      by_statement: z.string().optional(),
      oclc_numbers: z.array(z.string()).optional(),
      pagination: z.string().optional(),
      ocaid: z.string().optional(),
      contributions: z.array(z.string()).optional(),
      links: z
        .array(z.object({ url: z.string(), title: z.string() }))
        .optional(),
      copyright_date: z.string().optional(),
      publish_places: z.array(z.string()).optional(),
    }),
  ),
})

export const AuthorSchema = z.object({
  source_records: z.array(z.string()).optional(),
  personal_name: z.string().optional(),
  remote_ids: z.record(z.string()).optional(),
  birth_date: z.string().optional(),
  photos: z.array(z.number()).optional(),
  type: z.object({ key: z.string() }),
  alternate_names: z.array(z.string()).optional(),
  key: z.string(),
  bio: z.string().optional(),
  links: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        type: z.object({ key: z.string() }),
      }),
    )
    .optional(),
  name: z.string(),
  latest_revision: z.number().optional(),
  revision: z.number().optional(),
  created: z.object({ type: z.string(), value: z.string() }).optional(),
  last_modified: z.object({ type: z.string(), value: z.string() }).optional(),
})
