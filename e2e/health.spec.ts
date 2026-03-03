import { test, expect } from "@playwright/test";

test.describe("System Health", () => {
  test("Development server boots up", async ({ page, request }) => {
    // We ping the health API to ensure the test runner can talk to the Next.js server.
    // Once the frontend is implemented, this file can be replaced with real UI assertions.
    const response = await request.get("/api/health");
    // Either 200 OK (real credentials) or 503 Service Unavailable (dummy e2e credentials)
    expect([200, 503]).toContain(response.status());
    const json = await response.json();

    // This confirms our API responds appropriately over the E2E network boundary
    expect(json.success !== undefined || json.error !== undefined).toBeTruthy();
  });
});
