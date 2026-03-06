/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PreferencesCard } from "../preferences-card";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

// Mock the hooks and supabase client
vi.mock("@/lib/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("PreferencesCard Component", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockPreferences = {
    frequency: "weekly",
    locations: ["San Francisco", "Remote"],
  };

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    upsert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it("shows loading skeletons while user/preferences are loading", () => {
    (useUser as any).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<PreferencesCard />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders preferences data correctly from Supabase", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: mockPreferences,
      error: null,
    });

    render(<PreferencesCard />);

    await waitFor(() => {
      expect(screen.getByText("Weekly")).toBeDefined();
      expect(screen.getByText("San Francisco")).toBeDefined();
      expect(screen.getByText("Remote")).toBeDefined();
    });

    // Check if Weekly button has active styling (custom check depending on implementation)
    const weeklyBtn = screen.getByText("Weekly");
    expect(weeklyBtn.className).toContain("bg-white");
  });

  it("updates frequency when toggled", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: { frequency: "daily", locations: [] },
      error: null,
    });

    render(<PreferencesCard />);

    await waitFor(() => screen.getByText("Weekly"));

    const weeklyBtn = screen.getByText("Weekly");
    fireEvent.click(weeklyBtn);

    expect(weeklyBtn.className).toContain("bg-white");
  });

  it("adds a new location pill when typing and pressing Enter", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: { frequency: "daily", locations: [] },
      error: null,
    });

    render(<PreferencesCard />);

    await waitFor(() => screen.getByPlaceholderText(/Add location/i));

    const input = screen.getByPlaceholderText(/Add location/i);
    fireEvent.change(input, { target: { value: "New York" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("New York")).toBeDefined();
  });

  it("removes a location pill when clicking the X button", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: { frequency: "daily", locations: ["Austin"] },
      error: null,
    });

    render(<PreferencesCard />);

    await waitFor(() => screen.getByText("Austin"));

    // Find the button inside the Austin pill
    const austinPill = screen.getByText("Austin");
    const xButton = austinPill.querySelector("button");
    if (xButton) fireEvent.click(xButton);

    await waitFor(
      () => {
        expect(screen.queryByText("Austin")).toBeNull();
      },
      { timeout: 2000 }
    ); // Give time for framer-motion exit animation
  });

  it("calls supabase.upsert and shows success feedback when clicking Save", async () => {
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    mockSupabase.single.mockResolvedValue({
      data: mockPreferences,
      error: null,
    });

    mockSupabase.upsert.mockResolvedValue({ error: null });

    render(<PreferencesCard />);

    await waitFor(() => screen.getByText("Save Preferences"));

    const saveBtn = screen.getByText("Save Preferences");
    fireEvent.click(saveBtn);

    expect(mockSupabase.upsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      frequency: "weekly",
      locations: ["San Francisco", "Remote"],
    });

    await waitFor(() => {
      expect(screen.getByText("Preferences Saved!")).toBeDefined();
    });
  });
});
