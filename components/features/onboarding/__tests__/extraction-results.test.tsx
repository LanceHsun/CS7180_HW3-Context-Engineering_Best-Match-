/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtractionResults } from "../extraction-results";

// Use vi.hoisted to create stable mock references that survive vi.clearAllMocks
const mocks = vi.hoisted(() => ({
  mockSignInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Supabase client to avoid runtime env var errors
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: mocks.mockSignInWithOtp,
    },
  })),
}));

describe("ExtractionResults Component", () => {
  const mockOnComplete = vi.fn();
  const mockParsedData = {
    targetRole: "Senior Software Engineer",
    skills: ["React", "TypeScript", "Node.js"],
    yearsOfExperience: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply default resolved value after clearAllMocks wipes it
    mocks.mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("renders extraction results with provided data", () => {
    render(
      <ExtractionResults
        parsedData={mockParsedData}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText("AI Extraction Results")).toBeDefined();
    expect(screen.getByDisplayValue("Senior Software Engineer")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
  });

  it("updates email state and enables button when email is present", () => {
    render(
      <ExtractionResults
        parsedData={mockParsedData}
        onComplete={mockOnComplete}
      />
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });

    expect((submitButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect((emailInput as HTMLInputElement).value).toBe("test@example.com");
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows success message and redirects after clicking the button and API success", async () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;

    render(
      <ExtractionResults
        parsedData={mockParsedData}
        onComplete={mockOnComplete}
      />
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });
    fireEvent.click(submitButton);

    expect(screen.getByText("Creating your profile...")).toBeDefined();

    await waitFor(
      () => {
        expect(screen.getByText("Profile Created!")).toBeDefined();
        expect(
          screen.getByText(/We've started finding job matches for you/i)
        ).toBeDefined();
      },
      { timeout: 5000 }
    );

    // Verify redirect happens after timeout
    await waitFor(
      () => {
        expect(window.location.href).toContain(
          "/signin?message=signup_success"
        );
      },
      { timeout: 5000 }
    );

    // @ts-expect-error - necessary to restore the original location object in JSDom
    window.location = originalLocation;
  });

  it("handles API error correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "API specifically failed" }),
    });

    render(
      <ExtractionResults
        parsedData={mockParsedData}
        onComplete={mockOnComplete}
      />
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "error@example.com" } });

    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("API specifically failed")).toBeDefined();
    });
  });
});
