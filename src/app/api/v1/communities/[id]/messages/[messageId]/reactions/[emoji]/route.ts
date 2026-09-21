import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = {
  params: Promise<{ id: string; messageId: string; emoji: string }>;
};

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;
  const { messageId, emoji } = await ctx.params;
  const decodedEmoji = decodeURIComponent(emoji);

  const { error: dbError } = await supabase
    .from("nbp_community_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", nbpUser.id)
    .eq("emoji", decodedEmoji);

  if (dbError) return err("db_error", dbError.message, 500);

  return ok({ ok: true });
}
