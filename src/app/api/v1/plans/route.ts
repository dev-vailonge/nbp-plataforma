import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const query = supabase.from("nbp_action_plan_months").select("*");

  const userId = req.nextUrl.searchParams.get("user_id") ?? nbpUser.id;
  query.eq("user_id", userId);

  const year = req.nextUrl.searchParams.get("year");
  if (year) query.eq("year", parseInt(year, 10));

  const month = req.nextUrl.searchParams.get("month");
  if (month) query.eq("month", parseInt(month, 10));

  query.order("year", { ascending: false }).order("month", { ascending: false });

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
    .from("nbp_action_plan_months")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
