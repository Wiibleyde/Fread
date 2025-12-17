export type JWTPayload = {
    id: string;
    username: string;
    iat: number;
    exp: number;
}