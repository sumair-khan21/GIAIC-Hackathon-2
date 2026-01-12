"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">Todo App</h1>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user && (
              <span className="text-sm text-muted">
                {session.user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
