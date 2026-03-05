/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtractionResults } from "../extraction-results";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
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

  it("triggers onComplete after clicking the button and API success", async () => {
    vi.useFakeTimers();

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

    // Fast-forward 1s (enough for 500ms timeout)
    await vi.runAllTimersAsync();

    expect(mockOnComplete).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("sets the sb-mock-user cookie upon completion", async () => {
    vi.useFakeTimers();
    const cookieSpy = vi.spyOn(document, "cookie", "set");

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

    await vi.runAllTimersAsync();

    expect(document.cookie).toContain("sb-mock-user=test%40example.com");

    vi.useRealTimers();
    cookieSpy.mockRestore();
  });
});
