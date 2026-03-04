/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExtractionResults } from "../extraction-results";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ExtractionResults Component", () => {
  const mockOnComplete = vi.fn();

  it("renders extraction results with default values", () => {
    render(<ExtractionResults onComplete={mockOnComplete} />);

    expect(screen.getByText("AI Extraction Results")).toBeDefined();
    expect(screen.getByDisplayValue("Senior Software Engineer")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
  });

  it("updates email state and enables button when email is present", () => {
    render(<ExtractionResults onComplete={mockOnComplete} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });

    expect((submitButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect((emailInput as HTMLInputElement).value).toBe("test@example.com");
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("triggers onComplete after clicking the button", async () => {
    // Mock timers
    vi.useFakeTimers();

    render(<ExtractionResults onComplete={mockOnComplete} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });
    fireEvent.click(submitButton);

    expect(screen.getByText("Creating your profile...")).toBeDefined();

    // Fast-forward 2s
    vi.advanceTimersByTime(2000);

    expect(mockOnComplete).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("sets the sb-mock-user cookie upon completion", async () => {
    vi.useFakeTimers();
    const cookieSpy = vi.spyOn(document, "cookie", "set");

    render(<ExtractionResults onComplete={mockOnComplete} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", {
      name: /Start Receiving Matches/i,
    });
    fireEvent.click(submitButton);

    vi.advanceTimersByTime(2000);

    expect(document.cookie).toContain("sb-mock-user=test%40example.com");

    vi.useRealTimers();
    cookieSpy.mockRestore();
  });
});
