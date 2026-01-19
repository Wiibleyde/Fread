import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreatePost } from "@/hooks/mutations/usePost";

export function CreatePostForm() {
	const [content, setContent] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);
	const createPostMutation = useCreatePost();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		createPostMutation.mutate(
			{ content, isPrivate },
			{
				onSuccess: () => {
					setContent("");
					setIsPrivate(false);
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="border border-black p-4">
			<div className="mb-4">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="What's happening?"
					className="min-h-[100px] resize-none border-black"
					maxLength={500}
				/>
				<div className="mt-2 text-right text-sm text-gray-600">
					{content.length}/500
				</div>
			</div>

			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Switch
						id="private"
						checked={isPrivate}
						onCheckedChange={setIsPrivate}
					/>
					<Label htmlFor="private" className="cursor-pointer">
						Private post
					</Label>
				</div>

				<Button
					type="submit"
					disabled={!content.trim() || createPostMutation.isPending}
					className="bg-black text-white hover:bg-gray-800"
				>
					{createPostMutation.isPending ? "Posting..." : "Post"}
				</Button>
			</div>
		</form>
	);
}
