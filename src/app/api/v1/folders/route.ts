import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const userId = req.nextUrl.searchParams.get("user_id") ?? nbpUser.id;
  const parentId = req.nextUrl.searchParams.get("parent_id");

  const query = supabase
    .from("nbp_folders")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (parentId) query.eq("parent_id", parentId);

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
    .from("nbp_folders")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
