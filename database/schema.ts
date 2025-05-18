import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const authState = sqliteTable("auth_state", {
  key: text().primaryKey(),
  state: text().notNull(),
})

export const authSession = sqliteTable("auth_session", {
  key: text().primaryKey(),
  session: text().notNull(),
})
