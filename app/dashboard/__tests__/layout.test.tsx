/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import DashboardLayout from "../layout";

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock("@/lib/hooks/use-user", () => ({
    useUser: () => mockUseUser(),
}));

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe("DashboardLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading skeleton while isLoading is true (AC4)", () => {
        mockUseUser.mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });

        render(
            <DashboardLayout>
                <div data-testid="child">Dashboard Content</div>
            </DashboardLayout>
        );

        // Skeleton should be visible
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("renders children when authenticated", () => {
        mockUseUser.mockReturnValue({
            user: { id: "1", email: "test@example.com" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <DashboardLayout>
                <div data-testid="child">Dashboard Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("redirects to /signin when not authenticated", () => {
        mockUseUser.mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        render(
            <DashboardLayout>
                <div data-testid="child">Dashboard Content</div>
            </DashboardLayout>
        );

        expect(mockReplace).toHaveBeenCalledWith("/signin");
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
});
