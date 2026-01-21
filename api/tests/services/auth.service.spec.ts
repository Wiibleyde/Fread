import { authenticateUser } from "../../services/auth.service";
import { getAccountByIdDB } from "../../services/account.service";

jest.mock("../../services/account.service", () => ({
    getAccountByIdDB: jest.fn(),
}));

const mockedGetAccountByIdDB = getAccountByIdDB as jest.MockedFunction<
    typeof getAccountByIdDB
>;

const accountId = "acc_01FZACCOUNT123456789";

const baseAccount = {
    id: accountId,
    username: "john_doe",
    displayName: "John Doe",
    description: "Developer",
    private: false,
    profilePictureId: null,
    appleId: null,
    googleId: "google_123",
    discordId: "discord_123",
    admin: false,
    profileCompleted: true,
    createdAt: new Date("2025-01-01T12:00:00.000Z"),
    updatedAt: new Date("2025-01-01T12:00:00.000Z"),
};

describe("auth.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("authenticateUser", () => {
        it("délègue à getAccountByIdDB et renvoie le compte", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount as any);

            const result = await authenticateUser(accountId);

            expect(mockedGetAccountByIdDB).toHaveBeenCalledWith(accountId);
            expect(result).toBe(baseAccount);
        });
    });
});
