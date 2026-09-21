import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string; messageId: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;
  const { messageId } = await ctx.params;

  let body: { emoji?: string };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const emoji = body.emoji?.trim();
  if (!emoji) return err("bad_request", "emoji is required.", 400);

  const { data, error: dbError } = await supabase
    .from("nbp_community_reactions")
    .insert({
      message_id: messageId,
      user_id: nbpUser.id,
      emoji,
    })
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
