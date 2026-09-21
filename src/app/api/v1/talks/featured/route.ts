import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const { data, error: dbError } = await supabase
    .from("nbp_talks")
    .select("*")
    .eq("featured", true)
    .eq("status", "publicado")
    .limit(1)
    .single();

  if (dbError) {
    if (dbError.code === "PGRST116") return ok(null);
    return err("db_error", dbError.message, 500);
  }

  return ok(data);
}
