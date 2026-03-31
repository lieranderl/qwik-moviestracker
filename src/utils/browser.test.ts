import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	canUseStorage,
	readStorageJson,
	readStorageString,
	writeStorageJson,
	writeStorageString,
} from "./browser";

const originalStorage = globalThis.localStorage;

afterEach(() => {
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		writable: true,
		value: originalStorage,
	});
});

describe("browser storage helpers", () => {
	it("returns fallback values when localStorage is present but not a Storage API object", () => {
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			writable: true,
			value: {},
		});

		expect(canUseStorage()).toBe(false);
		expect(readStorageString("lang", "en-US")).toBe("en-US");
		expect(readStorageJson("prefs", { lang: "en-US" })).toEqual({
			lang: "en-US",
		});
		expect(() => writeStorageString("lang", "ru-RU")).not.toThrow();
		expect(() => writeStorageJson("prefs", { lang: "ru-RU" })).not.toThrow();
	});

	it("uses the storage API when getItem and setItem are available", () => {
		const storage = {
			getItem: mock((key: string) => (key === "lang" ? "en-US" : null)),
			setItem: mock(() => undefined),
		};

		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			writable: true,
			value: storage,
		});

		expect(canUseStorage()).toBe(true);
		expect(readStorageString("lang", "ru-RU")).toBe("en-US");

		writeStorageString("lang", "ru-RU");
		writeStorageJson("prefs", { lang: "ru-RU" });

		expect(storage.getItem).toHaveBeenCalledWith("lang");
		expect(storage.setItem).toHaveBeenCalledWith("lang", "ru-RU");
		expect(storage.setItem).toHaveBeenCalledWith(
			"prefs",
			JSON.stringify({ lang: "ru-RU" }),
		);
	});
});
