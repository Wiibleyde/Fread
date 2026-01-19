import { createFileRoute, useParams } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { PrivatePostPlaceholder } from "@/components/PrivatePostPlaceholder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReply } from "@/hooks/mutations/usePost";
import { usePost } from "@/hooks/queries/usePost";
import { useReplies } from "@/hooks/queries/useReplies";

export const Route = createFileRoute("/_authenticated/post/$id")({
	component: PostDetailPage,
});

function PostDetailPage() {
	const { id } = useParams({ from: "/_authenticated/post/$id" });
	const { data: post, isLoading, error } = usePost(id);
	const { data: replies, isLoading: repliesLoading } = useReplies(id);
	const [replyContent, setReplyContent] = useState("");
	const createReplyMutation = useCreateReply();

	const isPrivateError =
		error && (error as AxiosError)?.response?.status === 401;

	const handleReply = () => {
		if (!replyContent.trim()) return;

		createReplyMutation.mutate(
			{ postId: id, content: replyContent },
			{
				onSuccess: () => {
					setReplyContent("");
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-black p-8 text-center">
					<p>Loading post...</p>
				</div>
			</div>
		);
	}

	if (isPrivateError && post) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<PrivatePostPlaceholder authorId={post.accountId} />
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-red-600 bg-red-50 p-4 text-red-600">
					<p>Failed to load post</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl p-4">
			<div className="mb-6">
				<PostCard post={post} showReplies={false} />
			</div>

			<div className="mb-6 border border-black p-4">
				<h2 className="mb-4 text-xl font-bold">Reply</h2>
				<Textarea
					value={replyContent}
					onChange={(e) => setReplyContent(e.target.value)}
					placeholder="Write your reply..."
					className="mb-4 min-h-25 resize-none border-black"
					maxLength={500}
				/>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">
						{replyContent.length}/500
					</span>
					<Button
						onClick={handleReply}
						disabled={!replyContent.trim() || createReplyMutation.isPending}
						className="bg-black text-white hover:bg-gray-800"
					>
						{createReplyMutation.isPending ? "Posting..." : "Reply"}
					</Button>
				</div>
			</div>

			<div className="mb-4">
				<h2 className="text-xl font-bold">Replies ({replies?.length || 0})</h2>
			</div>

			{repliesLoading && (
				<div className="border border-black p-8 text-center">
					<p>Loading replies...</p>
				</div>
			)}

			{replies && replies.length === 0 && (
				<div className="border border-black p-8 text-center text-gray-600">
					<p>No replies yet. Be the first to reply!</p>
				</div>
			)}

			<div className="space-y-4">
				{replies?.map((reply) => (
					<PostCard key={reply.id} post={reply} showReplies={false} />
				))}
			</div>
		</div>
	);
}
