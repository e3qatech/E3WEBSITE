/**
 * Gate 05F: Explicit body-size enforcement for public API routes.
 * Returns a 413 response if Content-Length exceeds the limit.
 * For chunked transfers without Content-Length, the caller must
 * read the body and check size after parsing.
 */
import { NextResponse } from 'next/server';

export function enforceBodyLimit(
  request: Request,
  maxBytes: number
): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > maxBytes) {
      return NextResponse.json(
        { error: 'Payload Too Large' },
        {
          status: 413,
          headers: { 'X-Max-Body-Size': String(maxBytes) },
        }
      );
    }
  }
  return null; // within limit or no Content-Length header
}
