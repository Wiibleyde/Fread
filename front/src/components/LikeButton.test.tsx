import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { LikeButton } from "./LikeButton";

vi.mock("@/hooks/mutations/useLike", () => ({
	useLike: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
	useUnlike: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

describe("LikeButton", () => {
	it("should render with correct likes count", () => {
		render(<LikeButton postId="123" likesCount={5} />);

		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("should render unliked state by default", () => {
		render(<LikeButton postId="123" likesCount={0} />);

		const button = screen.getByRole("button");
		const heart = button.querySelector("svg");

		expect(heart).not.toHaveClass("fill-black");
	});

	it("should render liked state when isLiked is true", () => {
		render(<LikeButton postId="123" likesCount={1} isLiked={true} />);

		const button = screen.getByRole("button");
		const heart = button.querySelector("svg");

		expect(heart).toHaveClass("fill-black");
	});

	it("should render button element correctly", () => {
		render(<LikeButton postId="123" likesCount={0} />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	it("should display correct aria structure", () => {
		render(<LikeButton postId="123" likesCount={42} />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument();
	});
});
