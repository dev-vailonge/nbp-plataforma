import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const query = supabase
    .from("nbp_calendar_events")
    .select("*")
    .eq("user_id", nbpUser.id);

  const from = req.nextUrl.searchParams.get("from");
  if (from) query.gte("starts_at", from);

  const to = req.nextUrl.searchParams.get("to");
  if (to) query.lte("starts_at", to);

  query.order("starts_at", { ascending: true });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  if (!body.user_id) body.user_id = nbpUser.id;

  const { data, error: dbError } = await supabase
    .from("nbp_calendar_events")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
