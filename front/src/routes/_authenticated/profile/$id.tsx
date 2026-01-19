import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEditAccount } from "@/hooks/mutations/useAccount";
import { useAccount, useAccountPosts } from "@/hooks/queries/useAccount";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/profile/$id")({
	component: ProfilePage,
});

function ProfilePage() {
	const { id } = useParams({ from: "/_authenticated/profile/$id" });
	const { userId } = useAuth();
	const { data: account, isLoading: accountLoading } = useAccount(id);
	const { data: posts, isLoading: postsLoading } = useAccountPosts(id);
	const [isEditing, setIsEditing] = useState(false);
	const [displayName, setDisplayName] = useState("");
	const [description, setDescription] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);
	const editAccountMutation = useEditAccount();

	const isOwnProfile = userId === id;

	const handleEdit = () => {
		if (account) {
			setDisplayName(account.displayName);
			setDescription(account.description || "");
			setIsPrivate(account.private);
			setIsEditing(true);
		}
	};

	const handleSave = () => {
		editAccountMutation.mutate(
			{
				displayName: displayName || undefined,
				description: description || null,
				isPrivate,
			},
			{
				onSuccess: () => {
					setIsEditing(false);
				},
			},
		);
	};

	if (accountLoading) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-black p-8 text-center">
					<p>Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!account) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-red-600 bg-red-50 p-4 text-red-600">
					<p>Profile not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl p-4">
			{isEditing ? (
				<div className="mb-6 border border-black p-6">
					<h2 className="mb-4 text-2xl font-bold">Edit Profile</h2>

					<div className="mb-4">
						<Label htmlFor="displayName">Display Name</Label>
						<Textarea
							id="displayName"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							className="mt-2 border-black"
						/>
					</div>

					<div className="mb-4">
						<Label htmlFor="description">Bio</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="mt-2 min-h-25 border-black"
							maxLength={300}
						/>
					</div>

					<div className="mb-4 flex items-center gap-2">
						<Switch
							id="private"
							checked={isPrivate}
							onCheckedChange={setIsPrivate}
						/>
						<Label htmlFor="private">Private account</Label>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={handleSave}
							disabled={editAccountMutation.isPending}
							className="bg-black text-white hover:bg-gray-800"
						>
							{editAccountMutation.isPending ? "Saving..." : "Save"}
						</Button>
						<Button
							onClick={() => setIsEditing(false)}
							variant="outline"
							className="border-black"
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<div className="mb-6">
					<ProfileCard account={account} />
					{isOwnProfile && (
						<div className="mt-4">
							<Button
								onClick={handleEdit}
								variant="outline"
								className="border-black"
							>
								Edit Profile
							</Button>
						</div>
					)}
				</div>
			)}

			<div className="mb-4">
				<h2 className="text-2xl font-bold">Posts</h2>
			</div>

			{postsLoading && (
				<div className="border border-black p-8 text-center">
					<p>Loading posts...</p>
				</div>
			)}

			{posts && posts.length === 0 && (
				<div className="border border-black p-8 text-center text-gray-600">
					<p>No posts yet</p>
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
