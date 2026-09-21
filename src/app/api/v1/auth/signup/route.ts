import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { guardSupabase } from "@/lib/api/supabase-guard";

export async function POST(req: NextRequest) {
  const guard = await guardSupabase();
  if (guard.error) return guard.error;
  const { supabase } = guard;

  let body: { email?: string; password?: string; full_name?: string };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const email = body.email?.trim();
  const password = body.password;
  const fullName = body.full_name?.trim();
  if (!email || !password) {
    return err("bad_request", "email and password are required.", 400);
  }

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? "" } },
  });

  if (authError) {
    return err("auth_error", authError.message, 400);
  }

  const user = data.user;
  return ok({
    id: user?.id ?? null,
    email: user?.email ?? email,
    full_name: fullName ?? null,
  }, 201);
}
