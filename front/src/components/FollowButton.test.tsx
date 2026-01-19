import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { FollowButton } from "./FollowButton";

vi.mock("@/hooks/mutations/useFollow", () => ({
	useFollow: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
	useUnfollow: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

describe("FollowButton", () => {
	it("should render Follow text when not following", () => {
		render(<FollowButton accountId="123" />);

		expect(screen.getByText("Follow")).toBeInTheDocument();
	});

	it("should render Unfollow text when following", () => {
		render(<FollowButton accountId="123" isFollowing={true} />);

		expect(screen.getByText("Unfollow")).toBeInTheDocument();
	});

	it("should apply default variant when not following", () => {
		render(<FollowButton accountId="123" />);

		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-black");
		expect(button).toHaveClass("text-white");
	});

	it("should apply outline variant when following", () => {
		render(<FollowButton accountId="123" isFollowing={true} />);

		const button = screen.getByRole("button");
		expect(button).toHaveClass("border-black");
	});

	it("should render button with correct accessibility", () => {
		render(<FollowButton accountId="123" />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});

	it("should render as a button element", () => {
		render(<FollowButton accountId="123" />);

		const button = screen.getByRole("button");
		expect(button.tagName).toBe("BUTTON");
	});
});
