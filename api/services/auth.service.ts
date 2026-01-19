import { getAccountByIdDB } from "./account.service";


export async function authenticateUser(id: string) {
    return await getAccountByIdDB(id);
}
