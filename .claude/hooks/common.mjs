import fs from "node:fs";
import path from "node:path";

const DOC_ONLY_PATHS = [
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^\.mcp\.json$/,
  /^references\//,
  /^plans\//,
  /^\.claude\//,
  /^\.github\/copilot-instructions\.md$/,
];

const CODE_PATHS = [
  /^src\//,
  /^package\.json$/,
  /^vite\.config\.ts$/,
  /^eslint\.config\.js$/,
  /^tsconfig\.json$/,
  /^biome\.json$/,
  /^Dockerfile$/,
  /^cloudbuild\.ya?ml$/,
  /^gcloud_deploy\.sh$/,
  /^adapters\//,
];

const FULL_BUILD_PATHS = [
  /^src\/routes\//,
  /^src\/entry\./,
  /^Dockerfile$/,
  /^cloudbuild\.ya?ml$/,
  /^gcloud_deploy\.sh$/,
  /^vite\.config\.ts$/,
  /^adapters\//,
];

const PROTECTED_PATHS = [
  /^dist\//,
  /^server\//,
  /^\.env$/,
  /^\.env\./,
  /^adminSDK\.json$/,
];

export function readHookInput() {
  const raw = fs.readFileSync(0, "utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

export function getProjectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

export function normalizePath(projectDir, rawPath) {
  if (!rawPath || typeof rawPath !== "string") return null;
  const absolute = path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(projectDir, rawPath);
  const relative = path.relative(projectDir, absolute).replaceAll(path.sep, "/");
  if (!relative || relative.startsWith("../")) {
    return rawPath.replaceAll(path.sep, "/");
  }
  return relative;
}

export function collectToolPaths(projectDir, toolInput = {}) {
  const values = new Set();
  const candidates = [
    toolInput.file_path,
    toolInput.filePath,
    toolInput.path,
    toolInput.old_path,
    toolInput.new_path,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePath(projectDir, candidate);
    if (normalized) values.add(normalized);
  }

  return [...values];
}

export function isProtectedPath(filePath) {
  return PROTECTED_PATHS.some((pattern) => pattern.test(filePath));
}

export function isDocOnlyPath(filePath) {
  return DOC_ONLY_PATHS.some((pattern) => pattern.test(filePath));
}

export function isTrackedPath(filePath) {
  return CODE_PATHS.some((pattern) => pattern.test(filePath));
}

export function needsFullBuild(filePath) {
  return FULL_BUILD_PATHS.some((pattern) => pattern.test(filePath));
}

function getStateFile(projectDir) {
  const dir = path.join(projectDir, ".claude", "hooks", "state");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "sessions.json");
}

export function loadState(projectDir) {
  const file = getStateFile(projectDir);
  if (!fs.existsSync(file)) return { sessions: {} };
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { sessions: {} };
  }
}

export function saveState(projectDir, state) {
  const file = getStateFile(projectDir);
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

export function getSessionState(state, sessionId) {
  if (!state.sessions[sessionId]) {
    state.sessions[sessionId] = {
      editedFiles: [],
      requires: { buildTypes: false, lint: false, build: false },
      verified: { buildTypes: false, lint: false, build: false },
    };
  }
  return state.sessions[sessionId];
}

export function recomputeRequirements(session) {
  const tracked = session.editedFiles.filter((filePath) => isTrackedPath(filePath));
  session.requires = {
    buildTypes: tracked.length > 0,
    lint: tracked.length > 0,
    build: tracked.some((filePath) => needsFullBuild(filePath)),
  };
}

export function getMissingCommands(session) {
  const missing = [];
  if (session.requires.buildTypes && !session.verified.buildTypes) {
    missing.push("bun run build.types");
  }
  if (session.requires.lint && !session.verified.lint) {
    missing.push("bun run lint");
  }
  if (session.requires.build && !session.verified.build) {
    missing.push("bun run build");
  }
  return missing;
}

export function getVerificationCommand(command = "") {
  const normalized = command.trim();
  if (/^bun run build\.types(?:\s|$)/.test(normalized)) return "buildTypes";
  if (/^bun run lint(?:\s|$)/.test(normalized)) return "lint";
  if (/^bun run build(?:\s|$)/.test(normalized)) return "build";
  return null;
}
