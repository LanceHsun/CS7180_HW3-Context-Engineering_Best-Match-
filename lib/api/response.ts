import { NextResponse } from 'next/server';
import { ApiResponse, ApiErrorDetail } from './types';

export function successResponse<T>(data?: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            ...(data !== undefined && { data }),
        },
        { status }
    );
}

export function errorResponse(
    error: ApiErrorDetail,
    status = 400
): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}
