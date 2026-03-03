import { describe, expect, it } from 'vitest';
import { handleError, ApiError } from '../api/errorHandler';
import { z, ZodError } from 'zod';

describe('API Error Handler', () => {
    it('handles generic native errors', async () => {
        const error = new Error('Database disconnected');
        const response = handleError(error);

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(json.error.message).toBe('An unexpected error occurred.');
    });

    it('handles structured ApiErrors', async () => {
        const apiError = new ApiError('Access Denied', 403, 'FORBIDDEN');
        const response = handleError(apiError);

        expect(response.status).toBe(403);
        const json = await response.json();
        expect(json.error.code).toBe('FORBIDDEN');
        expect(json.error.message).toBe('Access Denied');
    });

    it('handles ZodErrors properly', async () => {
        const Schema = z.object({ age: z.number().min(18) });
        let zodErr: ZodError | null = null;
        try {
            Schema.parse({ age: 10 });
        } catch (e) {
            zodErr = e as ZodError;
        }

        const response = handleError(zodErr);
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(json.error.details.fieldErrors).toBeDefined();
    });
});
