import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const query = supabase.from("nbp_users").select("*");

  const role = req.nextUrl.searchParams.get("role");
  if (role) query.eq("role", role as "admin" | "consultor" | "membro");

  const status = req.nextUrl.searchParams.get("status");
  if (status) query.eq("membership_status", status as "ativo" | "inativo");

  const consultantId = req.nextUrl.searchParams.get("consultant_id");
  if (consultantId) query.eq("consultant_id", consultantId);

  query.order("full_name", { ascending: true });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .insert(body as never)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
