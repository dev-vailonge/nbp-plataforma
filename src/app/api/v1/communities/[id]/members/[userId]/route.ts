import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id: communityId, userId } = await ctx.params;

  const { error: dbError } = await supabase
    .from("nbp_community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (dbError) return err("db_error", dbError.message, 500);

  return ok({ ok: true });
}
