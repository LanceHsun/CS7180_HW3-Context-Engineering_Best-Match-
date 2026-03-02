import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../match/route';
import { validateRequest } from '../../../lib/validations/middleware';

vi.mock('../../../lib/validations/middleware', () => ({
    validateRequest: vi.fn(),
}));

describe('Match API (POST)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-gemini-key';
    });

    it('returns error if request validation fails', async () => {
        const mockErrorResponse = new Response('Validation Error', { status: 400 });
        vi.mocked(validateRequest).mockResolvedValue({
            data: null,
            error: mockErrorResponse as any
        });

        const req = new NextRequest('http://localhost:3000/api/match', {
            method: 'POST',
            body: JSON.stringify({ invalid: 'data' })
        });

        const res = await POST(req);
        expect(res).toBe(mockErrorResponse);
    });

    it('returns 500 if Gemini API key is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        vi.mocked(validateRequest).mockResolvedValue({
            data: { title: 'Software Engineer', company: 'Tech Inc' },
            error: null
        });

        const req = new NextRequest('http://localhost:3000/api/match', {
            method: 'POST',
            body: JSON.stringify({})
        });

        const res = await POST(req);
        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error.message).toContain('Gemini API key is not configured');
    });

    it('returns success response when matched with active key and valid data', async () => {
        const validJobDesc = { title: 'Software Engineer', company: 'Tech Inc' };
        vi.mocked(validateRequest).mockResolvedValue({
            data: validJobDesc,
            error: null
        });

        const req = new NextRequest('http://localhost:3000/api/match', {
            method: 'POST',
            body: JSON.stringify(validJobDesc)
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.receivedJob.title).toBe('Software Engineer');
        expect(data.data.status).toBe('success');
    });

    it('returns 500 when an unhandled internal exception is thrown', async () => {
        vi.mocked(validateRequest).mockRejectedValue(new Error('Fatal mock error'));

        const req = new NextRequest('http://localhost:3000/api/match', {
            method: 'POST'
        });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error.message).toContain('Failed to process match via Gemini');
    });
});
