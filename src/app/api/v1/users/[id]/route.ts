import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .update(body as never)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}
