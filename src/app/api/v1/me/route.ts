import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  return ok(result.ctx.nbpUser);
}

export async function PATCH(req: NextRequest) {
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

  const allowed = [
    "full_name", "company", "city", "sector", "phone",
    "instagram", "bio", "gender", "avatar_url",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return err("bad_request", "No updatable fields provided.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .update(updates as never)
    .eq("id", nbpUser.id)
    .select()
    .single();

  if (dbError) {
    return err("db_error", dbError.message, 500);
  }

  return ok(data);
}
