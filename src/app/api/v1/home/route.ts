import { ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import type { NbpActionPlanMonth } from "@/types/database";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const now = new Date().toISOString();

  const [sessionRes, planMonthRes, talkRes, rankingRes, statsRes] = await Promise.all([
    supabase
      .from("nbp_sessions")
      .select("*")
      .eq("member_id", nbpUser.id)
      .eq("status", "scheduled")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(1),
    supabase
      .from("nbp_action_plan_months")
      .select("*")
      .eq("user_id", nbpUser.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1),
    supabase
      .from("nbp_talks")
      .select("*")
      .eq("featured", true)
      .eq("status", "publicado")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("nbp_member_stats")
      .select("*")
      .order("rank", { ascending: true })
      .limit(10),
    supabase
      .from("nbp_member_stats")
      .select("*")
      .eq("user_id", nbpUser.id)
      .maybeSingle(),
  ]);

  const nextSession = sessionRes.data?.[0] ?? null;
  const latestMonthRaw = planMonthRes.data?.[0] ?? null;
  const latestMonth = latestMonthRaw as NbpActionPlanMonth | null;

  let stages: unknown[] = [];
  if (latestMonth) {
    const { data } = await supabase
      .from("nbp_action_plan_stages")
      .select("*")
      .eq("month_id", latestMonth.id)
      .order("position", { ascending: true });
    stages = data ?? [];
  }

  return ok({
    me: nbpUser,
    next_session: nextSession,
    plan_month: latestMonth,
    plan_stages: stages,
    featured_talk: talkRes.data ?? null,
    ranking: rankingRes.data ?? [],
    my_stats: statsRes.data ?? null,
  });
}
