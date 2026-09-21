import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const now = new Date().toISOString();

  const { data, error: dbError } = await supabase
    .from("nbp_sessions")
    .select("*")
    .eq("member_id", nbpUser.id)
    .eq("status", "scheduled")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true })
    .limit(1)
    .single();

  if (dbError) {
    if (dbError.code === "PGRST116") {
      return ok(null);
    }
    return err("db_error", dbError.message, 500);
  }

  return ok(data);
}
