import { NextRequest } from "next/server";
import { err, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import {
  fileKindFromMime,
  type DriveCrumb,
  type DriveFile,
  type DriveFolder,
  type DriveListing,
} from "@/lib/drive-folder";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const ID_RE = /^[a-zA-Z0-9_-]{10,}$/;

type DriveMeta = {
  id: string;
  name: string;
  mimeType?: string;
  parents?: string[];
  webViewLink?: string;
};

function openUrl(item: DriveMeta) {
  const mime = item.mimeType ?? "";
  if (mime === "application/vnd.google-apps.document") {
    return `https://docs.google.com/document/d/${item.id}/edit`;
  }
  if (mime === "application/vnd.google-apps.spreadsheet") {
    return `https://docs.google.com/spreadsheets/d/${item.id}/edit`;
  }
  if (mime === "application/vnd.google-apps.presentation") {
    return `https://docs.google.com/presentation/d/${item.id}/edit`;
  }
  return `https://drive.google.com/file/d/${item.id}/view`;
}

function emptyListing(): DriveListing {
  return {
    linked: false,
    root_id: null,
    folder_id: null,
    trail: [],
    folders: [],
    files: [],
  };
}

async function driveGet(id: string, key: string): Promise<DriveMeta | null> {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${id}`);
  url.searchParams.set("fields", "id,name,mimeType,parents,webViewLink");
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("key", key);
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Drive ${res.status}`);
  }
  return (await res.json()) as DriveMeta;
}

async function driveList(folderId: string, key: string): Promise<DriveMeta[]> {
  const files: DriveMeta[] = [];
  let pageToken = "";
  for (let page = 0; page < 5; page++) {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,webViewLink)");
    url.searchParams.set("orderBy", "folder,name");
    url.searchParams.set("pageSize", "200");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    url.searchParams.set("key", key);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || `Drive ${res.status}`);
    }
    const json = (await res.json()) as { nextPageToken?: string; files?: DriveMeta[] };
    files.push(...(json.files ?? []));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return files;
}

async function trailOf(folderId: string, rootId: string, key: string): Promise<DriveCrumb[] | null> {
  const crumbs: DriveCrumb[] = [];
  let current = folderId;
  for (let i = 0; i < 20; i++) {
    const meta = await driveGet(current, key);
    if (!meta) return null;
    crumbs.unshift({ id: meta.id, name: meta.name });
    if (current === rootId) return crumbs;
    const parent = meta.parents?.[0];
    if (!parent) return null;
    current = parent;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const requestedUser = req.nextUrl.searchParams.get("user_id");
  const targetId = nbpUser.role === "membro" ? nbpUser.id : (requestedUser ?? nbpUser.id);

  const { data: owner, error: dbError } = await supabase
    .from("nbp_users")
    .select("id, drive_folder_id")
    .or(`id.eq.${targetId},code.eq.${targetId}`)
    .limit(1)
    .maybeSingle();

  if (dbError) return err("db_error", dbError.message, 500);
  if (!owner) return err("not_found", "Membro não encontrado.", 404);
  if (!owner.drive_folder_id) return ok(emptyListing());

  const key = process.env.GOOGLE_DRIVE_API_KEY?.trim();
  if (!key) {
    return err(
      "drive_unconfigured",
      "A leitura do Drive não está configurada no servidor.",
      503,
    );
  }

  const rootId = owner.drive_folder_id;
  const asked = req.nextUrl.searchParams.get("folder_id")?.trim() || rootId;
  if (!ID_RE.test(asked)) return err("bad_request", "Pasta inválida.", 400);

  try {
    const rootMeta = await driveGet(rootId, key);
    if (!rootMeta) {
      return err(
        "drive_unavailable",
        "Não foi possível abrir a pasta. Confirma o link e que está partilhada.",
        502,
      );
    }

    const trail = await trailOf(asked, rootId, key);
    if (!trail) return err("forbidden", "Esta pasta não pertence ao Drive deste membro.", 403);

    const children = await driveList(asked, key);
    const folders: DriveFolder[] = [];
    const files: DriveFile[] = [];
    for (const item of children) {
      if (item.mimeType === FOLDER_MIME) {
        folders.push({ id: item.id, name: item.name });
      } else {
        files.push({
          id: item.id,
          name: item.name,
          file_kind: fileKindFromMime(item.mimeType ?? ""),
          url: item.webViewLink ?? openUrl(item),
        });
      }
    }

    const listing: DriveListing = {
      linked: true,
      root_id: rootId,
      folder_id: asked,
      trail,
      folders,
      files,
    };
    return ok(listing);
  } catch {
    return err("drive_error", "Não foi possível ler esta pasta no Drive.", 502);
  }
}
