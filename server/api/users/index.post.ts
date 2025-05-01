import { userInsertSchema } from '~/server/utils/serializers/user-serializers';
import { useSerializer } from '~/server/utils/serializers';
import { User } from '~/server/utils/drizzle';


export default defineEventHandler(async (event) => {
    const user = await useSerializer<User>(event, userInsertSchema);

    const drizzle = useDrizzle();

    const existingUser = drizzle.query.user.findFirst({
        where: (u, { eq }) => eq(u.name, user.name)
    });

    return existingUser ?? (await useDrizzle().insert(tables.user).values(user).onConflictDoNothing({ target: tables.user.name }).returning())[0];
});
