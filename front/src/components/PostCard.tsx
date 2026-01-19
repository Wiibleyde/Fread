import { Link } from "@tanstack/react-router";
import { Lock, MessageCircle } from "lucide-react";
import { useAccount } from "@/hooks/queries/useAccount";
import type { Post } from "@/lib/api-types";
import { LikeButton } from "./LikeButton";

interface PostCardProps {
	post: Post;
	showReplies?: boolean;
}

export function PostCard({ post, showReplies = true }: PostCardProps) {
	const { data: account } = useAccount(post.accountId);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	return (
		<div className="border border-black p-4">
			<div className="mb-3 flex items-start justify-between">
				<div className="flex-1">
					<Link
						to="/profile/$id"
						params={{ id: post.accountId }}
						className="font-bold hover:underline"
					>
						{account?.displayName || "Loading..."}
					</Link>
					<Link
						to="/profile/$id"
						params={{ id: post.accountId }}
						className="ml-2 text-sm text-gray-600"
					>
						@{account?.username || "..."}
					</Link>
				</div>
				{post.private && <Lock className="h-4 w-4 text-gray-600" />}
			</div>

			<Link to="/post/$id" params={{ id: post.id }} className="block">
				<p className="mb-3 whitespace-pre-wrap">{post.content}</p>
			</Link>

			<div className="flex items-center gap-4 text-sm text-gray-600">
				<span>{formatDate(post.creationDate)}</span>
			</div>

			<div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3">
				<LikeButton postId={post.id} likesCount={post.likesCount} />

				{showReplies && (
					<Link
						to="/post/$id"
						params={{ id: post.id }}
						className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-100"
					>
						<MessageCircle className="h-4 w-4" />
						<span>{post.repliesCount}</span>
					</Link>
				)}
			</div>
		</div>
	);
}
