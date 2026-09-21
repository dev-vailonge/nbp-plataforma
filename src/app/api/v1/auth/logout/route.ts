import { ok, err } from "@/lib/api/http";
import { guardSupabase } from "@/lib/api/supabase-guard";

export async function POST() {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { supabase } = guard;

  const { error: authError } = await supabase.auth.signOut();
  if (authError) {
    return err("auth_error", authError.message, 500);
  }

  return ok({ message: "Signed out." });
}
