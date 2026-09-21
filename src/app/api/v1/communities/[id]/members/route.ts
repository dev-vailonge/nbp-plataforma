import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id: communityId } = await ctx.params;

  let body: { user_id?: string };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const userId = body.user_id;
  if (!userId) return err("bad_request", "user_id is required.", 400);

  const { data, error: dbError } = await supabase
    .from("nbp_community_members")
    .insert({ community_id: communityId, user_id: userId })
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
