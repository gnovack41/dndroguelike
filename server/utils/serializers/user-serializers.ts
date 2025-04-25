import {createInsertSchema, createSelectSchema} from "drizzle-zod";
import {users} from "~/server/database/schema";


export const userSelectSchema = createSelectSchema(users);

export const userInsertSchema = createInsertSchema(users, {
    created_at: (schema) => schema.default(new Date()),
    modified_at: (schema) => schema.default(new Date()),
    email: (schema) => schema.email('Must be a valid email'),
});
