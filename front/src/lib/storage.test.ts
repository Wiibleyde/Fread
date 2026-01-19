import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { storage } from "@/lib/storage";

describe("storage utility", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	afterEach(() => {
		sessionStorage.clear();
	});

	describe("token operations", () => {
		it("should store and retrieve token", () => {
			const token = "test-token-123";
			storage.setToken(token);
			expect(storage.getToken()).toBe(token);
		});

		it("should return null when no token is stored", () => {
			expect(storage.getToken()).toBeNull();
		});

		it("should remove token", () => {
			storage.setToken("test-token");
			storage.removeToken();
			expect(storage.getToken()).toBeNull();
		});
	});

	describe("redirect URL operations", () => {
		it("should store and retrieve redirect URL", () => {
			const url = "https://example.com/redirect";
			storage.setRedirectUrl(url);
			expect(storage.getRedirectUrl()).toBe(url);
		});

		it("should return null when no redirect URL is stored", () => {
			expect(storage.getRedirectUrl()).toBeNull();
		});

		it("should remove redirect URL", () => {
			storage.setRedirectUrl("https://example.com");
			storage.removeRedirectUrl();
			expect(storage.getRedirectUrl()).toBeNull();
		});
	});

	describe("clear operation", () => {
		it("should clear all stored data", () => {
			storage.setToken("test-token");
			storage.setRedirectUrl("https://example.com");

			storage.clear();

			expect(storage.getToken()).toBeNull();
			expect(storage.getRedirectUrl()).toBeNull();
		});
	});
});
