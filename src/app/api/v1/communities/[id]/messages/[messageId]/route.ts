import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string; messageId: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;
  const { messageId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("nbp_community_messages")
    .select("author_id")
    .eq("id", messageId)
    .single();

  if (fetchErr) {
    const status = fetchErr.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", fetchErr.message, status);
  }

  if (existing.author_id !== nbpUser.id && nbpUser.role !== "admin") {
    return err("forbidden", "You can only edit your own messages.", 403);
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.body === "string") updates.body = body.body;
  if ("title" in body) updates.title = body.title;

  if (Object.keys(updates).length === 0) {
    return err("bad_request", "No updatable fields provided.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("nbp_community_messages")
    .update(updates as Partial<import("@/types/database").NbpCommunityMessage>)
    .eq("id", messageId)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data);
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;
  const { messageId } = await ctx.params;

  const { data: existing, error: fetchErr } = await supabase
    .from("nbp_community_messages")
    .select("author_id")
    .eq("id", messageId)
    .single();

  if (fetchErr) {
    const status = fetchErr.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", fetchErr.message, status);
  }

  if (existing.author_id !== nbpUser.id && nbpUser.role !== "admin") {
    return err("forbidden", "You can only delete your own messages.", 403);
  }

  const { error: dbError } = await supabase
    .from("nbp_community_messages")
    .delete()
    .eq("id", messageId);

  if (dbError) return err("db_error", dbError.message, 500);

  return ok({ ok: true });
}
