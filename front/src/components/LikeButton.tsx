import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLike, useUnlike } from "@/hooks/mutations/useLike";

interface LikeButtonProps {
	postId: string;
	likesCount: number;
	isLiked?: boolean;
}

export function LikeButton({
	postId,
	likesCount,
	isLiked = false,
}: LikeButtonProps) {
	const [liked, setLiked] = useState(isLiked);
	const likeMutation = useLike();
	const unlikeMutation = useUnlike();

	// Synchronize local state with prop when it changes (e.g., after refresh)
	useEffect(() => {
		setLiked(isLiked);
	}, [isLiked]);

	const handleClick = () => {
		if (liked) {
			unlikeMutation.mutate(postId);
			setLiked(false);
		} else {
			likeMutation.mutate(postId);
			setLiked(true);
		}
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleClick}
			disabled={likeMutation.isPending || unlikeMutation.isPending}
			className="gap-2"
		>
			<Heart className={`h-4 w-4 ${liked ? "fill-black" : ""}`} />
			<span>{likesCount}</span>
		</Button>
	);
}
