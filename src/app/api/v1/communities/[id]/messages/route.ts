import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id: communityId } = await ctx.params;

  const query = supabase
    .from("nbp_community_messages")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: true });

  const parentId = req.nextUrl.searchParams.get("parent_id");
  if (parentId === "null") {
    query.is("parent_id", null);
  } else if (parentId) {
    query.eq("parent_id", parentId);
  }

  const limit = req.nextUrl.searchParams.get("limit");
  if (limit) query.limit(parseInt(limit, 10) || 50);

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;
  const { id: communityId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const title = typeof body.title === "string" ? body.title : null;
  const parentId = typeof body.parent_id === "string" ? body.parent_id : null;
  const messageBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!messageBody) return err("bad_request", "body is required.", 400);

  const { data, error: dbError } = await supabase
    .from("nbp_community_messages")
    .insert({
      community_id: communityId,
      author_id: nbpUser.id,
      parent_id: parentId,
      title,
      body: messageBody,
    })
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
