import { beforeEach, describe, expect, it, mock } from "bun:test";
import { PARAM_LAUNCHER_SCRIPT } from "./param-launcher";

type StorageState = Record<string, string>;

const runLauncherScript = ({
  pathname = "/auth",
  search = "",
  hash = "",
  storageState = {},
  withStorage = true,
}: {
  pathname?: string;
  search?: string;
  hash?: string;
  storageState?: StorageState;
  withStorage?: boolean;
}) => {
  const replace = mock(() => {});
  const localStorage = withStorage
    ? {
        getItem(key: string) {
          return key in storageState ? storageState[key] : null;
        },
        setItem(key: string, value: string) {
          storageState[key] = value;
        },
      }
    : undefined;

  const windowLike = {
    localStorage,
    location: {
      pathname,
      hash,
      replace,
    },
  };

  Object.assign(globalThis, {
    window: windowLike,
    location: {
      search,
    },
  });

  new Function(PARAM_LAUNCHER_SCRIPT)();

  return { replace, storageState };
};

describe("PARAM_LAUNCHER_SCRIPT", () => {
  beforeEach(() => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { location?: unknown }).location;
  });

  it("parses as a valid inline script", () => {
    expect(() => new Function(PARAM_LAUNCHER_SCRIPT)).not.toThrow();
  });

  it("redirects to the stored language when the query parameter is missing", () => {
    const { replace } = runLauncherScript({
      search: "",
      storageState: { lang: "uk-UA" },
    });

    expect(replace).toHaveBeenCalledWith("/auth?lang=uk-UA");
  });

  it("stores the current query lang without forcing a redundant redirect", () => {
    const storageState: StorageState = {};
    const { replace } = runLauncherScript({
      search: "?lang=fr-FR",
      storageState,
    });

    expect(storageState.lang).toBe("fr-FR");
    expect(replace).not.toHaveBeenCalled();
  });

  it("does nothing when storage is unavailable", () => {
    const { replace } = runLauncherScript({
      search: "",
      withStorage: false,
    });

    expect(replace).not.toHaveBeenCalled();
  });
});
