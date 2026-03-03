import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateRequest } from '../middleware';
import { z } from 'zod';

const DummySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'Must be an adult')
});

describe('Validation Middleware', () => {
    it('returns validated data for correct JSON', async () => {
        const req = new NextRequest('http://localhost:3000', {
            method: 'POST',
            body: JSON.stringify({ name: 'Alice', age: 25 })
        });

        const result = await validateRequest(req, DummySchema);

        expect(result.error).toBeNull();
        expect(result.data).toEqual({ name: 'Alice', age: 25 });
    });

    it('returns 400 status with error details for invalid JSON payload according to Schema', async () => {
        const req = new NextRequest('http://localhost:3000', {
            method: 'POST',
            body: JSON.stringify({ name: '', age: 10 }) // Invalid age and empty name
        });

        const result = await validateRequest(req, DummySchema);

        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();

        if (result.error) {
            expect(result.error.status).toBe(400);
            const json = await result.error.json();
            expect(json.success).toBe(false);
            expect(json.error.code).toBe('VALIDATION_ERROR');
        }
    });

    it('returns 400 status if JSON is malformed and unparseable', async () => {
        const req = new NextRequest('http://localhost:3000', {
            method: 'POST',
            body: '{ badjson, }'
        });

        const result = await validateRequest(req, DummySchema);

        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();

        if (result.error) {
            expect(result.error.status).toBe(400);
            const json = await result.error.json();
            expect(json.error.code).toBe('BAD_REQUEST');
        }
    });
});
