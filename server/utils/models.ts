import {integer} from "drizzle-orm/sqlite-core";


export const baseModel = {
    id: integer().primaryKey({ autoIncrement: true }),
    created_at: integer( { mode: "timestamp" }).notNull(),
    modified_at: integer( { mode: "timestamp" }).notNull(),
}
