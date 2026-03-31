import {
  collectToolPaths,
  getProjectDir,
  isProtectedPath,
  readHookInput,
} from "./common.mjs";

const input = readHookInput();
const projectDir = getProjectDir(input);
const touchedPaths = collectToolPaths(projectDir, input.tool_input);
const blocked = touchedPaths.filter((filePath) => isProtectedPath(filePath));

if (blocked.length > 0) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason: `Protected path edit blocked: ${blocked.join(
        ", ",
      )}. Do not hand-edit generated output or sensitive files.`,
    }),
  );
}
