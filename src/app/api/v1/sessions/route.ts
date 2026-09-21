import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const query = supabase.from("nbp_sessions").select("*");

  const memberId = req.nextUrl.searchParams.get("member_id") ?? nbpUser.id;
  query.eq("member_id", memberId);

  const status = req.nextUrl.searchParams.get("status");
  if (status) query.eq("status", status as "scheduled" | "done" | "cancelled");

  query.order("starts_at", { ascending: false });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_sessions")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
