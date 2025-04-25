import * as schema from '../database/schema';
import {drizzle} from "drizzle-orm/d1";

export const tables = schema;

export function useDrizzle() {
    return drizzle(hubDatabase(), {schema});
}

export type User = typeof schema.users.$inferSelect;
