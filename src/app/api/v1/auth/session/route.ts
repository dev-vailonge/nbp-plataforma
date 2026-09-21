import { ok } from "@/lib/api/http";
import { guardSupabase } from "@/lib/api/supabase-guard";

export async function GET() {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { supabase } = guard;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return ok({ authenticated: !!user, user_id: user?.id ?? null });
}
