import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {baseModel} from "../utils/models";


export const users = sqliteTable('users', {
    ...baseModel,
    name: text().notNull(),
    email: text().notNull(),
});
