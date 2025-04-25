import { userSelectSchema } from '~/server/utils/serializers/user-serializers';
import type { User } from '~/server/utils/drizzle';
import { z } from 'zod';

export type UserResponse = Omit<User, 'created_at' | 'modified_at'> | { created_at: string, modified_at: string };

export default defineEventHandler(async (): Promise<UserResponse[]> => {
    const allUsers = await useDrizzle().select().from(tables.users).all();

    return z.array(userSelectSchema).parse(allUsers);
});
