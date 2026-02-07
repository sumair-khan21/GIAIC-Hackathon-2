import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  // Check for auth token in cookies
  const cookieStore = await cookies();
  const hasAuthToken =
    cookieStore.has("better-auth.session_token") ||
    cookieStore.has("__Secure-better-auth.session_token");

  // Redirect based on auth state
  if (hasAuthToken) {
    redirect("/dashboard");
  } else {
    redirect("/auth/signin");
  }
}
