import { NextRequest } from "next/server";
import { ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10) || 10, 1),
    100,
  );

  const { data, error: dbError } = await supabase
    .from("nbp_member_stats")
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit);

  if (dbError) {
    return ok([]);
  }

  return ok(data ?? []);
}
