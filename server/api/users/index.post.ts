import {userInsertSchema} from "~/server/utils/serializers/user-serializers";
import {useSerializer} from "~/server/utils/serializers";
import {User} from "~/server/utils/drizzle";


export default defineEventHandler(async (event) => {
    const user = await useSerializer<User>(event, userInsertSchema);

    await useDrizzle().insert(tables.users).values(user);
});
