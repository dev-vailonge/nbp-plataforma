import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { guardSupabase } from "@/lib/api/supabase-guard";

export async function POST(req: NextRequest) {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { supabase } = guard;

  let body: { email?: string; password?: string };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return err("bad_request", "email and password are required.", 400);
  }

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return err("auth_error", authError.message, 401);
  }

  const user = data.user;
  return ok({
    id: user.id,
    email: user.email,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  });
}
