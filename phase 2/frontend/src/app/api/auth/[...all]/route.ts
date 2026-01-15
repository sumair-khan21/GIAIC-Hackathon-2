import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime (required for PostgreSQL/better-auth)
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
