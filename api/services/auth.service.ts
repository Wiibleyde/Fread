import { getUserByIdDB } from "./account.service";


export async function authenticateUser(id: string) {
    return await getUserByIdDB(id);
}
