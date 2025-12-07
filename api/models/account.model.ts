export interface CreateAccountData {
    username: string;
    displayName: string;
    description?: string | null;
    private?: boolean;
    profilePictureId?: string | null;
    appleId?: string | null;
    googleId?: string | null;
    discordId?: string | null;
    profileCompleted: boolean;
}