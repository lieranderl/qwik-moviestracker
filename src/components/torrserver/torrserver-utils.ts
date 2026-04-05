export type TorrServerTone = "neutral" | "info" | "success" | "warning" | "error";

const TONE_BADGE_CLASSES: Record<TorrServerTone, string> = {
  neutral: "badge-ghost border-base-300 text-base-content/75",
  info: "badge-info badge-outline",
  success: "badge-success badge-outline",
  warning: "badge-warning badge-outline",
  error: "badge-error badge-outline",
};

const TONE_SURFACE_CLASSES: Record<TorrServerTone, string> = {
  neutral: "border-base-200 bg-base-100",
  info: "border-info/20 bg-info/5",
  success: "border-success/20 bg-success/5",
  warning: "border-warning/20 bg-warning/5",
  error: "border-error/20 bg-error/5",
};

const TONE_STAT_VALUE_CLASSES: Record<TorrServerTone, string> = {
  neutral: "text-base-content",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export const getToneBadgeClass = (tone: TorrServerTone): string =>
  TONE_BADGE_CLASSES[tone];

export const getToneSurfaceClass = (tone: TorrServerTone): string =>
  TONE_SURFACE_CLASSES[tone];

export const getToneStatValueClass = (tone: TorrServerTone): string =>
  TONE_STAT_VALUE_CLASSES[tone];

export const formatStatusLabel = (value?: string): string => {
  if (!value) {
    return "";
  }

  return value
    .replaceAll(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getStatusTone = (value?: string): TorrServerTone => {
  const normalized = formatStatusLabel(value).toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("failed") ||
    normalized.includes("closed")
  ) {
    return "error";
  }

  if (
    normalized.includes("working") ||
    normalized.includes("connected") ||
    normalized.includes("active") ||
    normalized.includes("ready")
  ) {
    return "success";
  }

  if (
    normalized.includes("preload") ||
    normalized.includes("loading") ||
    normalized.includes("connecting") ||
    normalized.includes("checking")
  ) {
    return "info";
  }

  if (normalized.includes("waiting") || normalized.includes("idle")) {
    return "warning";
  }

  return "neutral";
};

const formatUnitValue = (
  value: number,
  units: string[],
  fractionDigits = 1,
): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return `0 ${units[0] ?? ""}`.trim();
  }

  let scaled = value;
  let unitIndex = 0;

  while (scaled >= 1024 && unitIndex < units.length - 1) {
    scaled /= 1024;
    unitIndex += 1;
  }

  const digits = scaled >= 100 ? 0 : fractionDigits;
  return `${scaled.toFixed(digits)} ${units[unitIndex] ?? units.at(-1) ?? ""}`.trim();
};

export const formatBytes = (value?: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  return formatUnitValue(value, ["B", "KB", "MB", "GB", "TB"]);
};

export const formatRate = (value?: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "0 B/s";
  }

  return `${formatUnitValue(value, ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"])}`;
};

export const formatPercent = (value?: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0%";
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)}%`;
};

export const formatDuration = (value?: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "0m";
  }

  const rounded = Math.max(0, Math.round(value));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

export const formatCount = (
  value?: number | null,
  singular = "item",
  plural = "items",
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return `0 ${plural}`;
  }

  return `${value} ${value === 1 ? singular : plural}`;
};

const TONE_BTN_CLASSES: Record<TorrServerTone, string> = {
  neutral: "btn-ghost",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

export const getToneBtnClass = (tone: TorrServerTone): string =>
  TONE_BTN_CLASSES[tone] ?? "btn-primary";

export const getFileNameFromPath = (value?: string): string => {
  if (!value) {
    return "";
  }

  const compact = value.trim();
  if (!compact) {
    return "";
  }

  return compact.split(/[\\/]/).at(-1) ?? compact;
};

export const getFileTitle = (
  path: string | undefined,
  fallback = "Unnamed file",
): string => {
  const name = getFileNameFromPath(path);
  return name || fallback;
};
