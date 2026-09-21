import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";

function slugCode(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `les-${base || "aula"}-${Date.now().toString(36).slice(-4)}`;
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    module_id?: string;
    title?: string;
    description?: string | null;
    video_url?: string | null;
    duration_label?: string | null;
    status?: "rascunho" | "publicado";
    sort_order?: number;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const moduleId = body.module_id;
  const title = body.title?.trim();
  if (!moduleId) return err("bad_request", "module_id é obrigatório.", 400);
  if (!title) return err("bad_request", "Nome da aula é obrigatório.", 400);

  const insert = {
    module_id: moduleId,
    title,
    description: body.description?.trim() || null,
    video_url: body.video_url?.trim() || null,
    duration_label: body.duration_label?.trim() || null,
    session_label: null,
    status: body.status ?? "publicado",
    sort_order: body.sort_order ?? 0,
    code: body.code?.trim() || slugCode(title),
  };

  const { data, error: dbError } = await supabase
    .from("nbp_lessons")
    .insert(insert)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  return ok(data, 201);
}
