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

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
}

export interface GoogleUser {
    sub: string;
    email: string;
    picture: string | null;
    name: string | null;
}

export interface OauthInfos {
    id: string;
    username: string;
    picture: string | null;
    name: string | null;
}