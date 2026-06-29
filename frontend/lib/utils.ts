/**
 * Shared utility functions for the frontend.
 */

/**
 * Resolves or constructs the verification URL for a leave application.
 * Prioritizes the verification URL returned by the backend,
 * falling back to construction using NEXT_PUBLIC_APP_URL or http://localhost:3000.
 */
export function getVerificationUrl(token: string, verificationUrlFromApi?: string): string {
  if (verificationUrlFromApi) {
    return verificationUrlFromApi;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/verify/${token}`;
}
