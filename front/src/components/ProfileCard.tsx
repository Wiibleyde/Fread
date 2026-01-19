import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Account } from "@/lib/api-types";
import { FollowButton } from "./FollowButton";

interface ProfileCardProps {
	account: Account;
}

export function ProfileCard({ account }: ProfileCardProps) {
	const { userId } = useAuth();
	const isOwnProfile = userId === account.id;

	return (
		<div className="border border-black p-6">
			<div className="mb-4 flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold">{account.displayName}</h1>
					<p className="text-gray-600">@{account.username}</p>
				</div>
				{!isOwnProfile && (
					<FollowButton
						accountId={account.id}
						isFollowing={account.isFollowing}
					/>
				)}
			</div>

			{account.description && (
				<p className="mb-4 whitespace-pre-wrap">{account.description}</p>
			)}

			<div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
				{account.private && (
					<div className="flex items-center gap-1">
						<Lock className="h-4 w-4" />
						<span>Private account</span>
					</div>
				)}
			</div>

			<div className="flex gap-6 text-sm">
				<div>
					<span className="font-bold">{account.postsCount || 0}</span>
					<span className="ml-1 text-gray-600">Posts</span>
				</div>
				<Link
					to="/profile/$id/followed"
					params={{ id: account.id }}
					className="transition-opacity hover:opacity-70"
				>
					<span className="font-bold">{account.followingCount || 0}</span>
					<span className="ml-1 text-gray-600">Following</span>
				</Link>
				<Link
					to="/profile/$id/followers"
					params={{ id: account.id }}
					className="transition-opacity hover:opacity-70"
				>
					<span className="font-bold">{account.followersCount || 0}</span>
					<span className="ml-1 text-gray-600">Followers</span>
				</Link>
			</div>
		</div>
	);
}
