import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

// Mock Supabase server client
const mockSignOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockResolvedValue({
        auth: {
            signOut: () => mockSignOut(),
        },
    }),
}));

describe("POST /auth/signout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls supabase.auth.signOut()", async () => {
        const req = new NextRequest("http://localhost:3000/auth/signout", {
            method: "POST",
        });

        await POST(req);
        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("redirects to /signin after sign-out", async () => {
        const req = new NextRequest("http://localhost:3000/auth/signout", {
            method: "POST",
        });

        const res = await POST(req);
        expect(res.status).toBe(302);
        expect(res.headers.get("Location")).toContain("/signin");
    });

    it("clears the sb-mock-user cookie", async () => {
        const req = new NextRequest("http://localhost:3000/auth/signout", {
            method: "POST",
        });

        const res = await POST(req);
        const setCookie = res.headers.get("set-cookie") || "";
        expect(setCookie).toContain("sb-mock-user");
    });
});
