import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/**
 * Returns the Supabase server client or a 503 response when env vars are missing.
 */
export async function guardSupabase(): Promise<
  { supabase: SupabaseClient; error?: undefined } | { supabase?: undefined; error: NextResponse }
> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: { code: "supabase_unconfigured", message: "Supabase is not configured on this instance." } },
        { status: 503 },
      ),
    };
  }
  return { supabase };
}
