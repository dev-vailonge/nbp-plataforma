import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";

function slugCode(title: string, prefix: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `${prefix}${base || "item"}-${Date.now().toString(36).slice(-4)}`;
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    course_id?: string;
    title?: string;
    subtitle?: string | null;
    cover_url?: string | null;
    module_number?: number | null;
    sort_order?: number;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const courseId = body.course_id;
  const title = body.title?.trim();
  if (!courseId) return err("bad_request", "course_id é obrigatório.", 400);
  if (!title) return err("bad_request", "Nome do módulo é obrigatório.", 400);

  const insert = {
    course_id: courseId,
    title,
    subtitle: body.subtitle?.trim() || null,
    cover_url: body.cover_url?.trim() || null,
    module_number: body.module_number ?? null,
    sort_order: body.sort_order ?? 0,
    code: body.code?.trim() || slugCode(title, "mod-"),
    color: null,
    color_light: null,
  };

  const { data, error: dbError } = await supabase
    .from("nbp_modules")
    .insert(insert)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
