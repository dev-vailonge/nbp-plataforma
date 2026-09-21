import type { NbpUser } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { currentAdmin, currentMember } from "@/lib/mocks";

/**
 * Fetch the signed-in NBP user from Supabase by `auth_id`.
 * Falls back to mock data when Supabase is not configured.
 */
export async function getNbpUser(surface: "portal" | "admin" = "portal"): Promise<NbpUser> {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: nbpUser } = await supabase
        .from("nbp_users")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (nbpUser) return nbpUser as NbpUser;

      const fallback = surface === "admin" ? currentAdmin : currentMember;
      return {
        ...fallback,
        auth_id: user.id,
        email: user.email ?? fallback.email,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? fallback.full_name,
      };
    }
  }
  return surface === "admin" ? currentAdmin : currentMember;
}
