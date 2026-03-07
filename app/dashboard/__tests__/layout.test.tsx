/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { useUser } from "@/lib/hooks/use-user";
import { useRouter } from "next/navigation";
import DashboardLayout from "../layout";

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => mockUseUser(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
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

    // Skeleton should be visible, children should not
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("renders children when loading is complete", () => {
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
});
