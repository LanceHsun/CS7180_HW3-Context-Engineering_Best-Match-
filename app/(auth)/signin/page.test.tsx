/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignInPage from "./page";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("SignInPage", () => {
  const mockSignInWithOtp = vi.fn();
  const mockSupabase = {
    auth: {
      signInWithOtp: mockSignInWithOtp,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it("renders the sign-in form correctly", () => {
    render(<SignInPage />);
    expect(screen.getByText("Welcome back")).toBeDefined();
    expect(screen.getByLabelText("Email Address")).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Send Magic Link/i })
    ).toBeDefined();
  });

  it("updates email input correctly", () => {
    render(<SignInPage />);
    const input = screen.getByLabelText("Email Address") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });

  it("shows confirmation state on successful sign-in", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    render(<SignInPage />);

    const input = screen.getByLabelText("Email Address");
    const button = screen.getByRole("button", { name: /Send Magic Link/i });

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeDefined();
      expect(screen.getByText("test@example.com")).toBeDefined();
      expect(screen.getByText(/📬/)).toBeDefined();
    });
  });

  it("shows error message on sign-in failure", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "Invalid email" },
    });
    render(<SignInPage />);

    const input = screen.getByLabelText("Email Address");
    const button = screen.getByRole("button", { name: /Send Magic Link/i });

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeDefined();
    });
  });

  it("resets to input state when 'Use a different email' is clicked", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    render(<SignInPage />);

    // Go to confirmation state
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Magic Link/i }));

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeDefined();
    });

    // Reset
    fireEvent.click(
      screen.getByRole("button", { name: /Use a different email/i })
    );

    expect(screen.getByLabelText("Email Address")).toBeDefined();
  });
});
