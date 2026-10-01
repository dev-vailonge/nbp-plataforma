import type { FileKind } from "@/types/database";

const FOLDER_ID = /^[a-zA-Z0-9_-]{10,}$/;

export type DriveCrumb = { id: string; name: string };

export type DriveFolder = { id: string; name: string };

export type DriveFile = {
  id: string;
  name: string;
  file_kind: FileKind;
  url: string | null;
};

export type DriveListing = {
  linked: boolean;
  root_id: string | null;
  folder_id: string | null;
  trail: DriveCrumb[];
  folders: DriveFolder[];
  files: DriveFile[];
};

/** Accepts a Drive folder URL or a bare folder id. Returns null when empty or invalid. */
export function parseDriveFolderId(input: unknown): string | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const fromUrl = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fromUrl) return fromUrl[1]!;
  if (FOLDER_ID.test(raw) && !raw.includes("/")) return raw;
  return null;
}

export function driveFolderUrl(id: string) {
  return `https://drive.google.com/drive/folders/${id}`;
}

export function fileKindFromMime(mime: string): FileKind {
  switch (mime) {
    case "application/vnd.google-apps.document":
      return "gdoc";
    case "application/vnd.google-apps.spreadsheet":
      return "gsheet";
    case "application/pdf":
      return "pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
      return "xls";
    default:
      return "link";
  }
}
