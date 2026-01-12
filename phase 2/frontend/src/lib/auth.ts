import { createAuthClient } from "better-auth/react";

// Create Better Auth client for frontend
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

// Export auth methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;

// Helper to get current session
export async function getSession() {
  const session = await authClient.getSession();
  return session;
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.data?.user;
}

// Helper to get user ID from session
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.data?.user?.id || null;
}

// Helper to get session token for API calls
export async function getToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.data?.session?.token || null;
  } catch {
    return null;
  }
}
