import {
  collectToolPaths,
  getMissingCommands,
  getProjectDir,
  getSessionState,
  getVerificationCommand,
  isTrackedPath,
  loadState,
  readHookInput,
  recomputeRequirements,
  saveState,
} from "./common.mjs";

const input = readHookInput();
const projectDir = getProjectDir(input);
const sessionId = input.session_id || "default";
const state = loadState(projectDir);
const session = getSessionState(state, sessionId);

if (input.tool_name === "Bash") {
  const command = input.tool_input?.command || "";
  const verification = getVerificationCommand(command);
  if (verification) {
    session.verified[verification] = true;
    saveState(projectDir, state);
  }
  process.exit(0);
}

const touchedPaths = collectToolPaths(projectDir, input.tool_input).filter((filePath) =>
  isTrackedPath(filePath),
);

if (touchedPaths.length === 0) {
  process.exit(0);
}

session.editedFiles = [...new Set([...session.editedFiles, ...touchedPaths])];
session.verified = { buildTypes: false, lint: false, build: false };
recomputeRequirements(session);
saveState(projectDir, state);

const missing = getMissingCommands(session);
if (missing.length > 0) {
  console.log(
    JSON.stringify({
      decision: "approve",
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Verification required before completion for this session: ${missing.join(
          ", ",
        )}.`,
      },
    }),
  );
}
