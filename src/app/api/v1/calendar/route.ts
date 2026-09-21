import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return err("bad_request", "Both `from` and `to` query params are required (ISO date).", 400);
  }

  const [livesRes, personalRes, sessionsRes] = await Promise.all([
    supabase
      .from("nbp_live_events")
      .select("*")
      .gte("on_date", from)
      .lte("on_date", to)
      .order("on_date", { ascending: true }),
    supabase
      .from("nbp_calendar_events")
      .select("*")
      .eq("user_id", nbpUser.id)
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at", { ascending: true }),
    supabase
      .from("nbp_sessions")
      .select("*")
      .eq("member_id", nbpUser.id)
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at", { ascending: true }),
  ]);

  return ok({
    live_events: livesRes.data ?? [],
    personal_events: personalRes.data ?? [],
    sessions: sessionsRes.data ?? [],
  });
}
