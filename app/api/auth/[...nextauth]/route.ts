// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

// Export the GET and POST handlers for NextAuth
export const { GET, POST } = handlers;

// Ensure Node.js runtime (not Edge)
export const runtime = "nodejs";
