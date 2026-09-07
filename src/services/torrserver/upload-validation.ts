export const TORR_SERVER_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "",
  "application/octet-stream",
  "application/x-bittorrent",
]);
const fileNamePattern = /^[^/\\]+\.torrent$/i;

export type TorrServerUploadValidationResult =
  { ok: true; fileName: string } | { message: string; ok: false };

export const validateTorrServerUploadFile = (
  file?: Blob | null,
  fileName?: string,
): TorrServerUploadValidationResult => {
  const fileNameFromBlob = (file as unknown as { name?: unknown } | null)?.name;
  const name =
    fileName ?? (typeof fileNameFromBlob === "string" ? fileNameFromBlob : "");
  const normalizedName = name.trim();
  const hasControlCharacter = Array.from(normalizedName).some(
    (character) => character.charCodeAt(0) < 32,
  );

  if (!file) {
    return { message: "Select a .torrent file before uploading.", ok: false };
  }
  if (
    !normalizedName ||
    normalizedName.length <= ".torrent".length ||
    normalizedName !== name ||
    hasControlCharacter ||
    !fileNamePattern.test(normalizedName)
  ) {
    return {
      message: "Only files with a clean .torrent filename are allowed.",
      ok: false,
    };
  }
  if (file.size <= 0 || file.size > TORR_SERVER_UPLOAD_MAX_BYTES) {
    return {
      message: `Torrent file must be between 1 byte and ${Math.floor(TORR_SERVER_UPLOAD_MAX_BYTES / 1024 / 1024)} MB.`,
      ok: false,
    };
  }
  if (!allowedMimeTypes.has(file.type.toLowerCase())) {
    return {
      message:
        "Torrent file type is not accepted. Use application/x-bittorrent.",
      ok: false,
    };
  }
  return { fileName: normalizedName, ok: true };
};
