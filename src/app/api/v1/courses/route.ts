import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth, requireRole } from "@/lib/api/auth";
import type { CourseKind } from "@/types/database";

function slugCode(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `crs-${base || "curso"}-${Date.now().toString(36).slice(-4)}`;
}

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const { data, error: dbError } = await supabase
    .from("nbp_courses")
    .select("*")
    .order("sort_order", { ascending: true });

  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    title?: string;
    subtitle?: string | null;
    cover_url?: string | null;
    kind?: CourseKind;
    sort_order?: number;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const title = body.title?.trim();
  if (!title) return err("bad_request", "Nome do curso é obrigatório.", 400);

  const insert = {
    title,
    subtitle: body.subtitle?.trim() || null,
    cover_url: body.cover_url?.trim() || null,
    kind: body.kind ?? "formacao",
    sort_order: body.sort_order ?? 0,
    code: body.code?.trim() || slugCode(title),
  };

  const { data, error: dbError } = await supabase
    .from("nbp_courses")
    .insert(insert)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
