import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth, requireRole } from "@/lib/api/auth";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const { data, error: dbError } = await supabase
    .from("nbp_live_rules")
    .select("*")
    .order("weekday", { ascending: true });

  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function PUT(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: { rules?: Record<string, unknown>[] };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  if (!Array.isArray(body.rules)) {
    return err("bad_request", "Body must contain a `rules` array.", 400);
  }

  const results: unknown[] = [];
  for (const rule of body.rules) {
    if (rule.id) {
      const { id, ...rest } = rule;
      const { data, error } = await supabase
        .from("nbp_live_rules")
        .update(rest as never)
        .eq("id", id as string)
        .select()
        .single();
      if (error) return err("db_error", error.message, 500);
      results.push(data);
    } else {
      const { data, error } = await supabase
        .from("nbp_live_rules")
        .insert(rule as never)
        .select()
        .single();
      if (error) return err("db_error", error.message, 400);
      results.push(data);
    }
  }

  return ok(results);
}
