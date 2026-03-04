import { describe, expect, it } from "vitest";
import { errorResponse, successResponse } from "../api/response";

describe("API Response Helpers", () => {
  it("generates a success response format correctly", async () => {
    const data = { dummy: "test" };
    const response = successResponse(data, 201);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.dummy).toBe("test");
  });

  it("generates an error response format correctly", async () => {
    const apiError = { code: "NOT_FOUND", message: "Resource missing" };
    const response = errorResponse(apiError, 404);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("Resource missing");
  });
});
