import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function POST() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const today = new Date().toISOString().slice(0, 10);

  const { error: insertError } = await supabase
    .from("nbp_login_days")
    .insert({ user_id: nbpUser.id, on_date: today });

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" || insertError.message?.includes("duplicate");
    if (!isDuplicate) {
      return err("db_error", insertError.message, 500);
    }
  }

  const { data: refreshed, error: fetchError } = await supabase
    .from("nbp_users")
    .select("login_streak, last_login_on")
    .eq("id", nbpUser.id)
    .single();

  if (fetchError) {
    return err("db_error", fetchError.message, 500);
  }

  return ok({
    login_streak: refreshed.login_streak,
    last_login_on: refreshed.last_login_on,
  });
}
