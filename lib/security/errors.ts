import { NextResponse } from 'next/server';

export function getSafeErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && !/prisma|stack|sql|token|secret|credential/i.test(message)) {
      return message;
    }
  }

  return fallback;
}

export function jsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {}
) {
  const response = NextResponse.json(
    {
      ok: false,
      error: message,
      ...extra,
    },
    { status }
  );

  response.headers.set('Cache-Control', 'no-store');
  return response;
}
