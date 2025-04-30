import { eq } from 'drizzle-orm';


export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const user = await useDrizzle().select().from(tables.user).where(eq(tables.user.id, Number(id))).get();

    return userSelectSchema.parse(user);
});
