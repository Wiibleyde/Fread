import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/queries/useAccount";
import { useFollowed } from "@/hooks/queries/useFollow";

export const Route = createFileRoute("/_authenticated/profile/$id/followed")({
	component: FollowedPage,
});

function FollowedPage() {
	const { id } = useParams({ from: "/_authenticated/profile/$id/followed" });
	const { data: account, isLoading: accountLoading } = useAccount(id);
	const { data: followedData, isLoading: followedLoading } = useFollowed(id);

	if (accountLoading || followedLoading) {
		return (
			<div className="mx-auto max-w-2xl p-4">
				<div className="border border-black p-8 text-center">
					<p>Loading followed accounts...</p>
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

	const followed = followedData?.followed || [];

	return (
		<div className="mx-auto max-w-2xl p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					{account.displayName}'s Following
				</h1>
				<Link to="/profile/$id" params={{ id }}>
					<Button variant="outline">Back to Profile</Button>
				</Link>
			</div>

			<div className="border border-black p-4">
				{followed.length === 0 ? (
					<p className="text-center text-gray-600">Not following anyone yet</p>
				) : (
					<div className="space-y-4">
						{followed.map((followedAccount) => (
							<Link
								key={followedAccount.id}
								to="/profile/$id"
								params={{ id: followedAccount.id }}
								className="block"
							>
								<div className="flex items-center justify-between border border-black p-4 transition-colors hover:bg-gray-50">
									<div className="flex items-center space-x-4">
										{followedAccount.profilePictureId && (
											<img
												src={`/api/files/${followedAccount.profilePictureId}`}
												alt={followedAccount.displayName}
												className="h-12 w-12 rounded-full border border-black object-cover"
											/>
										)}
										<div>
											<p className="font-bold">{followedAccount.displayName}</p>
											<p className="text-sm text-gray-600">
												@{followedAccount.username}
											</p>
											{followedAccount.description && (
												<p className="mt-1 text-sm text-gray-700">
													{followedAccount.description}
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
