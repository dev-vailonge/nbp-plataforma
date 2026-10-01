import { NextRequest } from "next/server";
import { err, ok, parseJson, JsonParseError } from "@/lib/api/http";
import { guardSupabase } from "@/lib/api/supabase-guard";

type RouteCtx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { token } = await ctx.params;

  const { data, error } = await guard.supabase.rpc("nbp_invite_preview", { p_token: token });
  if (error) return err("db_error", error.message, 500);
  const invite = data?.[0];
  if (!invite) return err("not_found", "Este convite já não está disponível.", 404);
  return ok(invite);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { supabase } = guard;
  const { token } = await ctx.params;

  let body: { password?: string };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const password = body.password ?? "";
  if (password.length < 6) {
    return err("bad_request", "A palavra-passe precisa de pelo menos 6 caracteres.", 400);
  }

  const { data: preview, error: previewError } = await supabase.rpc("nbp_invite_preview", {
    p_token: token,
  });
  if (previewError) return err("db_error", previewError.message, 500);
  const invite = preview?.[0];
  if (!invite) return err("not_found", "Este convite já não está disponível.", 404);

  const { data, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password,
    options: { data: { full_name: invite.full_name } },
  });
  if (authError) return err("auth_error", authError.message, 400);

  return ok({
    email: invite.email,
    full_name: invite.full_name,
    confirmed: Boolean(data.session),
  });
}
