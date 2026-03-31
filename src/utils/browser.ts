export const canUseDocument = () => typeof document !== "undefined";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const getStorage = (): StorageLike | null => {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  try {
    const storage = globalThis.localStorage;
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function"
    ) {
      return null;
    }

    return storage;
  } catch {
    return null;
  }
};

export const canUseStorage = () => getStorage() !== null;

export const readStorageString = (
  key: string,
  fallback: string | null = null,
): string | null => {
  if (!canUseStorage()) {
    return fallback;
  }

  return getStorage()?.getItem(key) ?? fallback;
};

export const writeStorageString = (key: string, value: string): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(key, value);
};

export const readStorageJson = <TData>(key: string, fallback: TData): TData => {
  const value = readStorageString(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as TData;
  } catch {
    return fallback;
  }
};

export const writeStorageJson = (key: string, value: unknown): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
};

export const showDialogById = (id: string): HTMLDialogElement | null => {
  if (!canUseDocument()) {
    return null;
  }

  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement)) {
    return null;
  }

  dialog.showModal();
  return dialog;
};
