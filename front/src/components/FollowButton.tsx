import { Button } from "@/components/ui/button";
import { useFollow, useUnfollow } from "@/hooks/mutations/useFollow";
import { useState } from "react";

interface FollowButtonProps {
	accountId: string;
	isFollowing?: boolean;
}

export function FollowButton({
	accountId,
	isFollowing = false,
}: FollowButtonProps) {
	const [following, setFollowing] = useState(isFollowing);
	const followMutation = useFollow();
	const unfollowMutation = useUnfollow();

	const handleClick = () => {
		if (following) {
			unfollowMutation.mutate(accountId);
			setFollowing(false);
		} else {
			followMutation.mutate(accountId);
			setFollowing(true);
		}
	};

	return (
		<Button
			variant={following ? "outline" : "default"}
			onClick={handleClick}
			disabled={followMutation.isPending || unfollowMutation.isPending}
			className={
				following ? "border-black" : "bg-black text-white hover:bg-gray-800"
			}
		>
			{following ? "Unfollow" : "Follow"}
		</Button>
	);
}
