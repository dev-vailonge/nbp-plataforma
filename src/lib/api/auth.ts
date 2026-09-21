import { NextResponse } from "next/server";
import type { NbpRole, NbpUser } from "@/types/database";
import { guardSupabase } from "./supabase-guard";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>>;

export type AuthContext = {
  supabase: SupabaseClient;
  authUser: { id: string; email: string };
  nbpUser: NbpUser;
};

type AuthResult =
  | { ctx: AuthContext; error?: undefined }
  | { ctx?: undefined; error: NextResponse };

/**
 * Ensures the request comes from an authenticated Supabase user and looks up
 * the corresponding `nbp_users` row by `auth_id`.
 */
export async function requireAuth(): Promise<AuthResult> {
  const guard = await guardSupabase();
  if (guard.error) return { error: guard.error };
  const { supabase } = guard;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: { code: "unauthorized", message: "Authentication required." } },
        { status: 401 },
      ),
    };
  }

  const { data: nbpUser, error: dbError } = await supabase
    .from("nbp_users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (dbError || !nbpUser) {
    return {
      error: NextResponse.json(
        { error: { code: "user_not_found", message: "NBP user profile not found." } },
        { status: 404 },
      ),
    };
  }

  return {
    ctx: {
      supabase,
      authUser: { id: user.id, email: user.email ?? "" },
      nbpUser: nbpUser as NbpUser,
    },
  };
}

/**
 * Same as `requireAuth` but additionally checks that the NBP user has one of
 * the given roles.
 */
export async function requireRole(...roles: NbpRole[]): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;

  if (!roles.includes(result.ctx.nbpUser.role)) {
    return {
      error: NextResponse.json(
        { error: { code: "forbidden", message: "You do not have permission to perform this action." } },
        { status: 403 },
      ),
    };
  }

  return result;
}
