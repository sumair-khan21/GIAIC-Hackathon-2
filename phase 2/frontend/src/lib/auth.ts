import { createAuthClient } from "better-auth/react";

// Create Better Auth client for frontend
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

// Export auth methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;

// Helper to get session token directly for API calls
export async function getToken(): Promise<string | null> {
  try {
    // Always fetch fresh session for API calls to ensure we have valid token
    const session = await authClient.getSession();
    return session?.data?.session?.token || null;
  } catch {
    return null;
  }
}

// Helper to get user ID from session
export async function getUserId(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    return session?.data?.user?.id || null;
  } catch {
    return null;
  }
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await authClient.getSession();
    return !!session?.data?.user;
  } catch {
    return false;
  }
}
