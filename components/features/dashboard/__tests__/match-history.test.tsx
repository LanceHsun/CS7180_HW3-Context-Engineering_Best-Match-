/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MatchHistory } from "../match-history";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

// Mock the hooks and supabase client
vi.mock("@/lib/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("MatchHistory Component", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockMatches = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      job_title: "Senior Software Engineer",
      company: "Google",
      score: 95,
      apply_url: "https://google.com/jobs",
      created_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      job_title: "Product Manager",
      company: "Meta",
      score: 85,
      apply_url: "https://meta.com/jobs",
      created_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      job_title: "Data Scientist",
      company: "Amazon",
      score: 75,
      apply_url: null,
      created_at: new Date().toISOString(),
    },
  ];

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it("shows loading skeleton while user is loading", () => {
    (useUser as any).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<MatchHistory />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state when no matches are found", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (mockSupabase.limit as any).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<MatchHistory />);

    await waitFor(() => {
      expect(
        screen.getByText("No matches have been delivered yet.")
      ).toBeDefined();
    });
  });

  it("renders match history data correctly", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (mockSupabase.limit as any).mockResolvedValue({
      data: mockMatches,
      error: null,
    });

    render(<MatchHistory />);

    await waitFor(() => {
      expect(screen.getByText("Senior Software Engineer")).toBeDefined();
      expect(screen.getByText("Google")).toBeDefined();
      expect(screen.getByText("95%")).toBeDefined();

      expect(screen.getByText("Product Manager")).toBeDefined();
      expect(screen.getByText("Meta")).toBeDefined();
      expect(screen.getByText("85%")).toBeDefined();

      expect(screen.getByText("Data Scientist")).toBeDefined();
      expect(screen.getByText("Amazon")).toBeDefined();
      expect(screen.getByText("75%")).toBeDefined();
    });
  });

  it("renders job role as a link when apply_url is present", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (mockSupabase.limit as any).mockResolvedValue({
      data: [mockMatches[0]],
      error: null,
    });

    render(<MatchHistory />);

    await waitFor(() => {
      const link = screen.getByRole("link", {
        name: /senior software engineer/i,
      });
      expect(link).toBeDefined();
      expect(link.getAttribute("href")).toBe("https://google.com/jobs");
      expect(link.getAttribute("target")).toBe("_blank");
    });
  });

  it("renders job role as text when apply_url is missing", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (mockSupabase.limit as any).mockResolvedValue({
      data: [mockMatches[2]],
      error: null,
    });

    render(<MatchHistory />);

    await waitFor(() => {
      expect(screen.getByText("Data Scientist")).toBeDefined();
      const link = screen.queryByRole("link", { name: /data scientist/i });
      expect(link).toBeNull();
    });
  });
});
