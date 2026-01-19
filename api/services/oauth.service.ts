import type { Request } from "express";
import { env } from "../env";
import type { Account } from "../generated/prisma/client";
import type {
	DiscordUser,
	GoogleUser,
	OauthInfos,
} from "../models/account.model";
import { prisma } from "../prisma";
import { createAccountDB, getAccountByUsernameDB } from "./account.service";
import { createFileDB } from "./file.service";

export const buildAuthUrl = (provider: "discord" | "google"): string => {
	switch (provider) {
		case "discord":
			return `https://discord.com/oauth2/authorize?client_id=${env.AUTH_DISCORD_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}&scope=identify+email`;
		case "google":
			return (
				"https://accounts.google.com/o/oauth2/v2/auth?" +
				new URLSearchParams({
					client_id: env.AUTH_GOOGLE_ID,
					redirect_uri: env.GOOGLE_REDIRECT_URI,
					response_type: "code",
					scope: ["openid", "email", "profile"].join(" "),
					access_type: "offline",
					prompt: "consent",
				}).toString()
			);
		default:
			throw new Error("Unsupported provider");
	}
};

export const getCodeFromCallback = (req: Request): string => {
	const code = req.query.code as string;

	return code;
};

export const getAccessTokenFromCallback = async (
	provider: "discord" | "google",
	code: string,
): Promise<{ access_token: string; token_type: string }> => {
	let tokenResponse: globalThis.Response;

	if (provider === "discord") {
		tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: env.AUTH_DISCORD_ID,
				client_secret: env.AUTH_DISCORD_SECRET,
				grant_type: "authorization_code",
				code,
				redirect_uri: env.DISCORD_REDIRECT_URI,
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			throw new Error(`Token exchange failed: ${errorText}`);
		}

		const tokenData = await tokenResponse.json();

		if (!tokenData.access_token) {
			throw new Error(
				`No access token in response: ${JSON.stringify(tokenData)}`,
			);
		}

		const { access_token, token_type } = tokenData as {
			access_token: string;
			token_type: string;
		};

		return { access_token, token_type };
	} else if (provider === "google") {
		tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: env.AUTH_GOOGLE_ID,
				client_secret: env.AUTH_GOOGLE_SECRET,
				grant_type: "authorization_code",
				code,
				redirect_uri: env.GOOGLE_REDIRECT_URI,
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			throw new Error(`Token exchange failed: ${errorText}`);
		}

		const tokenData = await tokenResponse.json();

		if (!tokenData.access_token) {
			throw new Error(
				`No access token in response: ${JSON.stringify(tokenData)}`,
			);
		}

		const { access_token } = tokenData as {
			access_token: string;
			token_type: string;
		};

		return { access_token, token_type: "Bearer" };
	} else {
		throw new Error("Unsupported provider");
	}
};

export const getUserInfo = async (
	provider: "discord" | "google",
	access_token: string,
	token_type: string,
): Promise<OauthInfos> => {
	let userResponse: globalThis.Response;

	if (provider === "discord") {
		userResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `${token_type} ${access_token}`,
			},
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			throw new Error(`User info failed: ${errorText}`);
		}

		const userDatas = (await userResponse.json()) as DiscordUser;

		return {
			discordId: userDatas.id,
			username: userDatas.username,
			picture: userDatas.avatar
				? `https://cdn.discordapp.com/avatars/${userDatas.id}/${userDatas.avatar}.png`
				: null,
			name: userDatas.global_name,
		};
	} else if (provider === "google") {
		userResponse = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			},
		);

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			throw new Error(`User info failed: ${errorText}`);
		}

		const userDatas = (await userResponse.json()) as GoogleUser;

		return {
			googleId: userDatas.sub,
			username: userDatas.email,
			picture: userDatas.picture,
			name: userDatas.name,
		};
	} else {
		throw new Error("Unsupported provider");
	}
};

export const createUser = async (userDatas: OauthInfos): Promise<Account> => {
	let username = userDatas.username;
	let existingAccount = await getAccountByUsernameDB(username);

	// If username already exists, append random suffix until we find unique one
	while (existingAccount) {
		const randomSuffix = Math.floor(Math.random() * 10000);
		username = `${userDatas.username}_${randomSuffix}`;
		existingAccount = await getAccountByUsernameDB(username);
	}

	const account = await createAccountDB({
		googleId: userDatas.googleId,
		discordId: userDatas.discordId,
		username,
		profileCompleted: false,
		description: "",
		displayName: userDatas.name || userDatas.username,
	});

	if (userDatas.picture) {
		const picture = await createFileDB(account.id, userDatas.picture);
		await prisma.account.update({
			where: { id: account.id },
			data: { profilePictureId: picture.id },
		});
	}

	return account;
};
