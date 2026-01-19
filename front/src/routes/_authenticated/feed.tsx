import { createFileRoute } from "@tanstack/react-router";
import { CreatePostForm } from "@/components/CreatePostForm";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/queries/usePosts";

export const Route = createFileRoute("/_authenticated/feed")({
	component: FeedPage,
});

function FeedPage() {
	const { data: posts, isLoading, error } = usePosts();

	return (
		<div className="mx-auto max-w-2xl p-4">
			<h1 className="mb-6 text-3xl font-bold">Feed</h1>

			<div className="mb-6">
				<CreatePostForm />
			</div>

			{isLoading && (
				<div className="border border-black p-8 text-center">
					<p>Loading posts...</p>
				</div>
			)}

			{error && (
				<div className="border border-red-600 bg-red-50 p-4 text-red-600">
					<p>Failed to load posts. Please try again.</p>
				</div>
			)}

			{posts && posts.length === 0 && (
				<div className="border border-black p-8 text-center text-gray-600">
					<p>No posts yet. Be the first to post!</p>
				</div>
			)}

			<div className="space-y-4">
				{posts?.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</div>
	);
}
