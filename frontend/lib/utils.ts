/**
 * Shared utility functions for the frontend.
 */

/**
 * Resolves or constructs the verification URL for a leave application.
 * Prioritizes the verification URL returned by the backend,
 * falling back to construction using NEXT_PUBLIC_APP_URL or http://localhost:3000.
 */
export function getVerificationUrl(token: string, verificationUrlFromApi?: string): string {
  // If the API returns a localhost URL but the frontend is running on a production domain, ignore the api's localhost URL.
  if (verificationUrlFromApi) {
    const isLocalhostApi = verificationUrlFromApi.includes('localhost') || verificationUrlFromApi.includes('127.0.0.1');
    const isLocalhostFrontend = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isLocalhostApi && !isLocalhostFrontend) {
      // In production but API returned localhost, ignore it and construct using browser origin
    } else {
      return verificationUrlFromApi;
    }
  }
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/verify/${token}`;
  }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/verify/${token}`;
}
