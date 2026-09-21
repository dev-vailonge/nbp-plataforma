import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth, requireRole } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const query = supabase.from("nbp_live_events").select("*");

  const from = req.nextUrl.searchParams.get("from");
  if (from) query.gte("on_date", from);

  const to = req.nextUrl.searchParams.get("to");
  if (to) query.lte("on_date", to);

  query.order("on_date", { ascending: true });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
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
    .from("nbp_live_events")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
