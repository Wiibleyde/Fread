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