import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/queries/useAccount";
import { useFollowers } from "@/hooks/queries/useFollow";

export const Route = createFileRoute("/_authenticated/profile/$id/followers")({
	component: FollowersPage,
});

function FollowersPage() {
	const { id } = useParams({ from: "/_authenticated/profile/$id/followers" });
	const { data: account, isLoading: accountLoading } = useAccount(id);
	const { data: followersData, isLoading: followersLoading } = useFollowers(id);

	if (accountLoading || followersLoading) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-black p-8 text-center">
					<p>Loading followers...</p>
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

	const followers = followersData?.followers || [];

	return (
		<div className="mx-auto max-w-2xl p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					{account.displayName}'s Followers
				</h1>
				<Link to="/profile/$id" params={{ id }}>
					<Button variant="outline">Back to Profile</Button>
				</Link>
			</div>

			<div className="border border-black p-4">
				{followers.length === 0 ? (
					<p className="text-center text-gray-600">No followers yet</p>
				) : (
					<div className="space-y-4">
						{followers.map((follower) => (
							<Link
								key={follower.id}
								to="/profile/$id"
								params={{ id: follower.id }}
								className="block"
							>
								<div className="flex items-center justify-between border border-black p-4 transition-colors hover:bg-gray-50">
									<div className="flex items-center space-x-4">
										{follower.profilePictureId && (
											<img
												src={`/api/files/${follower.profilePictureId}`}
												alt={follower.displayName}
												className="h-12 w-12 rounded-full border border-black object-cover"
											/>
										)}
										<div>
											<p className="font-bold">{follower.displayName}</p>
											<p className="text-sm text-gray-600">
												@{follower.username}
											</p>
											{follower.description && (
												<p className="mt-1 text-sm text-gray-700">
													{follower.description}
												</p>
											)}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
