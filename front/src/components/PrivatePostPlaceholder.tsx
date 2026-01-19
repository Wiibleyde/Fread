import { FollowButton } from "./FollowButton";

interface PrivatePostPlaceholderProps {
	authorId: string;
}

export function PrivatePostPlaceholder({
	authorId,
}: PrivatePostPlaceholderProps) {
	return (
		<div className="border border-black p-6 text-center">
			<p className="mb-4 text-gray-600">This post is private</p>
			<p className="mb-4 text-sm">
				Follow this user to view their private posts
			</p>
			<FollowButton accountId={authorId} />
		</div>
	);
}
