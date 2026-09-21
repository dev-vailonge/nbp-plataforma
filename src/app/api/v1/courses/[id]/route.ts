import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth, requireRole } from "@/lib/api/auth";
import type { NbpCourse, NbpModule, NbpLesson } from "@/types/database";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  const { data: courseRaw, error: courseErr } = await supabase
    .from("nbp_courses")
    .select("*")
    .eq("id", id)
    .single();

  if (courseErr) {
    const status = courseErr.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", courseErr.message, status);
  }

  const course = courseRaw as NbpCourse;

  const { data: modsRaw } = await supabase
    .from("nbp_modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  const mods = (modsRaw ?? []) as NbpModule[];
  const moduleIds = mods.map((m) => m.id);
  let lessons: NbpLesson[] = [];

  if (moduleIds.length > 0) {
    const { data: lessonsData } = await supabase
      .from("nbp_lessons")
      .select("*")
      .in("module_id", moduleIds)
      .order("sort_order", { ascending: true });
    lessons = (lessonsData ?? []) as NbpLesson[];
  }

  return ok({
    ...course,
    modules: mods.map((mod) => ({
      ...mod,
      lessons: lessons.filter((l) => l.module_id === mod.id),
    })),
  });
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_courses")
    .update(body as never)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}
