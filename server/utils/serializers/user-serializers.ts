import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { user } from '~/server/database/schema/users';
import { baseModelSerializerFields } from '../../database/schema/utils';


export const userSelectSchema = createSelectSchema(user);

export const userInsertSchema = createInsertSchema(user, {
    ...baseModelSerializerFields,
    email: (schema) => schema.email('Must be a valid email'),
});
