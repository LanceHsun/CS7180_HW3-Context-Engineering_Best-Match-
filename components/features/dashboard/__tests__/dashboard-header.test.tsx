/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHeader } from "../dashboard-header";

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock("@/lib/hooks/use-user", () => ({
    useUser: () => mockUseUser(),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        refresh: mockRefresh,
    }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        header: ({
            children,
            ...props
        }: React.PropsWithChildren<Record<string, unknown>>) => (
            <header {...props}>{children}</header>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("DashboardHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseUser.mockReturnValue({
            user: { id: "1", email: "test@example.com" },
            isLoading: false,
            isAuthenticated: true,
        });
    });

    it("displays user email", () => {
        render(<DashboardHeader />);
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("renders Sign Out button", () => {
        render(<DashboardHeader />);
        expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    });

    it("calls signout API when Sign Out is clicked", async () => {
        mockFetch.mockResolvedValueOnce({
            redirected: false,
            url: "http://localhost:3000/signin",
        });

        render(<DashboardHeader />);
        fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

        expect(mockFetch).toHaveBeenCalledWith("/auth/signout", { method: "POST" });
    });
});
