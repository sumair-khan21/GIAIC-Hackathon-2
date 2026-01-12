"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-error mb-4">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted mb-6 max-w-md">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Dashboard
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
