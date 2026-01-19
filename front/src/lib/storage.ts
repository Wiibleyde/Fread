const TOKEN_KEY = "auth_token";
const REDIRECT_URL_KEY = "oauth_redirect_url";

export const storage = {
	getToken: (): string | null => {
		return sessionStorage.getItem(TOKEN_KEY);
	},

	setToken: (token: string): void => {
		sessionStorage.setItem(TOKEN_KEY, token);
	},

	removeToken: (): void => {
		sessionStorage.removeItem(TOKEN_KEY);
	},

	getRedirectUrl: (): string | null => {
		return sessionStorage.getItem(REDIRECT_URL_KEY);
	},

	setRedirectUrl: (url: string): void => {
		sessionStorage.setItem(REDIRECT_URL_KEY, url);
	},

	removeRedirectUrl: (): void => {
		sessionStorage.removeItem(REDIRECT_URL_KEY);
	},

	clear: (): void => {
		sessionStorage.removeItem(TOKEN_KEY);
		sessionStorage.removeItem(REDIRECT_URL_KEY);
	},
};
