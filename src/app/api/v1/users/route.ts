import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import type { MembershipStatus, NbpRole, Sector } from "@/types/database";

function slugCode(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `m-${base || "membro"}-${Date.now().toString(36).slice(-4)}`;
}

export async function GET(req: NextRequest) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const query = supabase.from("nbp_users").select("*");

  const role = req.nextUrl.searchParams.get("role");
  if (role) query.eq("role", role as NbpRole);

  const status = req.nextUrl.searchParams.get("status");
  if (status) query.eq("membership_status", status as MembershipStatus);

  const consultantId = req.nextUrl.searchParams.get("consultant_id");
  if (consultantId) query.eq("consultant_id", consultantId);

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  query.order("full_name", { ascending: true });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  let rows = data ?? [];
  if (q) {
    rows = rows.filter((u) =>
      [u.full_name, u.email, u.company, u.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  return ok(rows);
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    full_name?: string;
    email?: string;
    company?: string | null;
    city?: string | null;
    sector?: Sector | null;
    phone?: string | null;
    instagram?: string | null;
    bio?: string | null;
    membership_status?: MembershipStatus;
    consultant_id?: string | null;
    gender?: "m" | "f" | null;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const fullName = body.full_name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!fullName) return err("bad_request", "Nome é obrigatório.", 400);
  if (!email) return err("bad_request", "Email é obrigatório.", 400);

  const insert = {
    full_name: fullName,
    email,
    company: body.company?.trim() || null,
    city: body.city?.trim() || null,
    sector: body.sector || null,
    phone: body.phone?.trim() || null,
    instagram: body.instagram?.trim() || null,
    bio: body.bio?.trim() || null,
    membership_status: body.membership_status ?? "ativo",
    consultant_id: body.consultant_id || null,
    gender: body.gender || null,
    role: "membro" as NbpRole,
    code: body.code?.trim() || slugCode(fullName),
    auth_id: null,
    avatar_url: null,
    login_streak: 0,
    last_login_on: null,
  };

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .insert(insert)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
