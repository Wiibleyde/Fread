export const queryKeys = {
	posts: {
		all: ["posts"] as const,
		lists: () => [...queryKeys.posts.all, "list"] as const,
		list: (accountId?: string) =>
			[...queryKeys.posts.lists(), { accountId }] as const,
		details: () => [...queryKeys.posts.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.posts.details(), id] as const,
		replies: (postId: string) =>
			[...queryKeys.posts.all, "replies", postId] as const,
	},
	account: {
		all: ["account"] as const,
		profile: (id: string) => [...queryKeys.account.all, "profile", id] as const,
		me: () => [...queryKeys.account.all, "me"] as const,
	},
	follows: {
		all: ["follows"] as const,
		followers: (id: string) =>
			[...queryKeys.follows.all, "followers", id] as const,
		following: (id: string) =>
			[...queryKeys.follows.all, "following", id] as const,
	},
	likes: {
		all: ["likes"] as const,
		byPost: (postId: string) =>
			[...queryKeys.likes.all, "post", postId] as const,
	},
};
