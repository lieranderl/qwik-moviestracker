export { PARAM_LAUNCHER_SCRIPT } from "./param-launcher-script";
import { PARAM_LAUNCHER_SCRIPT } from "./param-launcher-script";

export const ParamsLauncher = ({ nonce }: { nonce?: string }) => (
  <script nonce={nonce} dangerouslySetInnerHTML={PARAM_LAUNCHER_SCRIPT} />
);
