/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileCard } from "../profile-card";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

// Mock the hooks and supabase client
vi.mock("@/lib/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("ProfileCard Component (Revised)", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    user_metadata: {
      full_name: "Test User",
    },
  };

  const mockProfile = {
    id: "test-profile-id",
    target_role: "Frontend Engineer",
    skills: [
      "React",
      "TypeScript",
      "TailwindCSS",
      "Vite",
      "Jest",
      "Playwright",
      "GraphQL",
    ],
  };

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    global.fetch = vi.fn();
  });

  it("shows loading skeleton while user is loading", () => {
    (useUser as any).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<ProfileCard />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders profile data correctly with a limit of 15 skills", async () => {
    const manySkills = Array.from({ length: 20 }, (_, i) => `Skill ${i + 1}`);
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: { ...mockProfile, skills: manySkills },
      error: null,
    });

    render(<ProfileCard />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeDefined();
      expect(screen.getByText("test@example.com")).toBeDefined();

      // Should show first 15 skills
      for (let i = 0; i < 15; i++) {
        expect(screen.getByText(`Skill ${i + 1}`)).toBeDefined();
      }
      // Should NOT show the 16th skill
      expect(screen.queryByText("Skill 16")).toBeNull();
    });

    expect(screen.getByText("Update Resume")).toBeDefined();
  });

  it("triggers file upload and profile update when a new resume is selected", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    // Mock successful parse and update
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { targetRole: "New Role", skills: ["New Skill"] },
        }),
      }) // Mock /api/resume/parse
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      }); // Mock /api/profile

    render(<ProfileCard />);

    await waitFor(() => screen.getByText("Update Resume"));

    const updateButton = screen.getByText("Update Resume");
    const file = new File(["dummy content"], "resume.pdf", {
      type: "application/pdf",
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show updating state
    expect(screen.getByText("Updating...")).toBeDefined();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockSupabase.single).toHaveBeenCalledTimes(2); // Initial + final refresh
    });
  });

  it("handles non-PDF file upload error", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    render(<ProfileCard />);

    await waitFor(() => screen.getByText("Update Resume"));

    const file = new File(["dummy content"], "resume.txt", {
      type: "text/plain",
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Please upload a PDF file.")).toBeDefined();
    });
  });
});
