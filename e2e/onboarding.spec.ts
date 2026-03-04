import { test, expect } from "@playwright/test";
import * as fs from "fs";

test.describe("Onboarding PDF Upload Flow", () => {
  // Create a dummy PDF file for testing
  const dummyPdfPath = "test-resume.pdf";

  test.beforeAll(() => {
    // Write a tiny valid-ish PDF file (just enough to bypass basic mime checks,
    // though pdf-parse might complain if it's not a real PDF. For E2E we usually mock the API or use a real stub)
    // For simplicity in a real integration we'd mock the network response. Let's mock the API route to avoid hitting Gemini in CI.
    fs.writeFileSync(dummyPdfPath, "%PDF-1.4\n%EOF\n");
  });

  test.afterAll(() => {
    if (fs.existsSync(dummyPdfPath)) {
      fs.unlinkSync(dummyPdfPath);
    }
  });

  test("successfully uploads and parses a resume", async ({ page }) => {
    // Mock the API response so we don't actually hit Gemini during E2E tests
    await page.route("/api/resume/parse", async (route) => {
      const json = {
        success: true,
        data: {
          targetRole: "Senior Software Engineer",
          skills: ["React", "TypeScript", "Node.js"],
          yearsOfExperience: 8,
        },
      };
      await route.fulfill({ json });
    });

    await page.goto("/onboarding");

    // Verify header
    await expect(page.locator("h1")).toContainText("Upload your resume");

    // Make the hidden file input visible or simply set the files on it directly
    const fileChooserPromise = page.waitForEvent("filechooser");
    // Click the label that triggers the file input
    await page.getByText("click to upload").click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(dummyPdfPath);

    // After upload, the scanning animation should appear
    await expect(page.getByText("PARSING RESUME")).toBeVisible();

    // After our mocked response returns, the success state should appear
    await expect(page.getByText("Successfully Parsed!")).toBeVisible();

    // Verify the parsed data is rendered in the form
    await expect(page.locator("input#targetRole")).toHaveValue(
      "Senior Software Engineer"
    );
    await expect(page.getByText("React").first()).toBeVisible();
    await expect(page.getByText("TypeScript").first()).toBeVisible();
    await expect(page.getByText("Node.js").first()).toBeVisible();

    // Fill the email and continue
    await page.fill("input#email", "test@example.com");
    await page
      .getByRole("button", { name: /Start Receiving Matches/i })
      .click();

    // Verify redirect to signin
    await expect(page).toHaveURL(/\/signin\?email=test%40example\.com/);
  });
});
