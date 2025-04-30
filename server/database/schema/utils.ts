import { integer } from 'drizzle-orm/sqlite-core';
import type { ZodDate } from 'zod';


export const baseModel = {
    id: integer().primaryKey({ autoIncrement: true }),
    created_at: integer({ mode: 'timestamp' }).notNull(),
    modified_at: integer({ mode: 'timestamp' }).notNull(),
};

export const baseModelSerializerFields = {
    created_at: (schema: ZodDate) => schema.default(new Date()),
    modified_at: (schema: ZodDate) => schema.default(new Date()),
};
