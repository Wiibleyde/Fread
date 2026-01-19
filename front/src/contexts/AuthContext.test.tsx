import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "@/lib/storage";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("jwt-decode", () => ({
	jwtDecode: vi.fn((token: string) => {
		if (token === "valid-token") {
			return {
				id: "user-123",
				username: "testuser",
				iat: Math.floor(Date.now() / 1000) - 3600,
				exp: Math.floor(Date.now() / 1000) + 3600,
			};
		}
		if (token === "expired-token") {
			return {
				id: "user-123",
				username: "testuser",
				iat: Math.floor(Date.now() / 1000) - 7200,
				exp: Math.floor(Date.now() / 1000) - 3600,
			};
		}
		throw new Error("Invalid token");
	}),
}));

describe("AuthContext", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.clearAllMocks();
	});

	it("should throw error when useAuth is used outside provider", () => {
		expect(() => {
			renderHook(() => useAuth());
		}).toThrow("useAuth must be used within an AuthProvider");
	});

	it("should initialize with no authentication", () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		expect(result.current.token).toBeNull();
		expect(result.current.userId).toBeNull();
		expect(result.current.username).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("should login with valid token", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		act(() => {
			result.current.login("valid-token");
		});

		await waitFor(() => {
			expect(result.current.token).toBe("valid-token");
			expect(result.current.userId).toBe("user-123");
			expect(result.current.username).toBe("testuser");
			expect(result.current.isAuthenticated).toBe(true);
		});

		expect(storage.getToken()).toBe("valid-token");
	});

	it("should logout and clear storage", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		act(() => {
			result.current.login("valid-token");
		});

		await waitFor(() => {
			expect(result.current.isAuthenticated).toBe(true);
		});

		act(() => {
			result.current.logout();
		});

		expect(result.current.token).toBeNull();
		expect(result.current.userId).toBeNull();
		expect(result.current.username).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
		expect(storage.getToken()).toBeNull();
	});

	it("should auto-logout when token is expired", async () => {
		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		act(() => {
			result.current.login("expired-token");
		});

		await waitFor(() => {
			expect(result.current.token).toBeNull();
			expect(result.current.isAuthenticated).toBe(false);
		});
	});

	it("should handle invalid token and logout", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		act(() => {
			result.current.login("invalid-token");
		});

		await waitFor(() => {
			expect(result.current.token).toBeNull();
			expect(result.current.isAuthenticated).toBe(false);
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Invalid token:",
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});

	it("should initialize with existing token from storage", async () => {
		storage.setToken("valid-token");

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		});

		await waitFor(() => {
			expect(result.current.token).toBe("valid-token");
			expect(result.current.userId).toBe("user-123");
			expect(result.current.username).toBe("testuser");
			expect(result.current.isAuthenticated).toBe(true);
		});
	});
});
