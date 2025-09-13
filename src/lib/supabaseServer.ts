import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export function createClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Not needed for server-side operations
        },
      },
    }
  );
}
