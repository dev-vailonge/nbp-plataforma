import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import { randomBytes } from "crypto";
import { parseDriveFolderId } from "@/lib/drive-folder";
import { canAdminSetPhase, isMemberPhase } from "@/lib/member-phase";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .select("*")
    .or(`id.eq.${id},code.eq.${id}`)
    .limit(1)
    .maybeSingle();

  if (dbError) {
    return err("db_error", dbError.message, 500);
  }
  if (!data) {
    return err("not_found", "User not found.", 404);
  }

  return ok(data);
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

  if ("drive_folder_id" in body) {
    const driveFolderId = parseDriveFolderId(body.drive_folder_id);
    if (body.drive_folder_id && String(body.drive_folder_id).trim() && !driveFolderId) {
      return err("bad_request", "Cola o link da pasta do Google Drive.", 400);
    }
    body.drive_folder_id = driveFolderId;
  }

  const { data: found, error: findError } = await supabase
    .from("nbp_users")
    .select("id, phase, phase_before_pause")
    .or(`id.eq.${id},code.eq.${id}`)
    .limit(1)
    .maybeSingle();

  if (findError) return err("db_error", findError.message, 500);
  if (!found) return err("not_found", "User not found.", 404);

  if (body.regenerate_invite) {
    if (found.phase !== "convite_criado") {
      return err("bad_request", "O convite só pode ser renovado antes de ser aceito.", 400);
    }
    body.invite_token = randomBytes(24).toString("base64url");
    delete body.regenerate_invite;
  }

  if ("phase" in body) {
    if (!isMemberPhase(body.phase)) return err("bad_request", "Fase inválida.", 400);
    const before = isMemberPhase(found.phase_before_pause) ? found.phase_before_pause : null;
    if (!isMemberPhase(found.phase) || !canAdminSetPhase(found.phase, body.phase, before)) {
      return err("bad_request", "Esta fase ainda não pode ser marcada.", 400);
    }
    if (body.phase === "pausado") {
      body.phase_before_pause = found.phase;
      body.membership_status = "inativo";
    } else if (found.phase === "pausado") {
      body.phase_before_pause = null;
      body.membership_status = "ativo";
    }
  }

  const { data, error: dbError } = await supabase
    .from("nbp_users")
    .update(body as never)
    .eq("id", found.id)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}
