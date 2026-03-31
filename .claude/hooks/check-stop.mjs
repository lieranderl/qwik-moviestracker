import {
  getMissingCommands,
  getProjectDir,
  getSessionState,
  loadState,
  readHookInput,
} from "./common.mjs";

const input = readHookInput();
const projectDir = getProjectDir(input);
const sessionId = input.session_id || "default";
const state = loadState(projectDir);
const session = getSessionState(state, sessionId);
const missing = getMissingCommands(session);

if (missing.length > 0) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason: `Required verification has not run for this session: ${missing.join(
        ", ",
      )}.`,
    }),
  );
}
