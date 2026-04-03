import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
  createRecentSearchHref,
  pushRecentSearchQuery,
  readRecentSearches,
} from "./recent-activity";

type LocalStorageMock = {
  getItem: (key: string) => null | string;
  setItem: (key: string, value: string) => void;
};

const createLocalStorageMock = (): LocalStorageMock => {
  const store = new Map<string, string>();

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
};

const originalLocalStorage = globalThis.localStorage;

describe("recent search helpers", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createLocalStorageMock(),
      writable: true,
    });
  });

  afterEach(() => {
    if (originalLocalStorage === undefined) {
      Reflect.deleteProperty(globalThis, "localStorage");
      return;
    }

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
      writable: true,
    });
  });

  it("builds search URLs that keep the current lang and encode the query", () => {
    expect(
      createRecentSearchHref({
        lang: "en-US",
        query: "  star wars  ",
      }),
    ).toBe("/search/?lang=en-US&q=star%20wars");
  });

  it("stores trimmed recent searches and replaces older case-insensitive duplicates", () => {
    pushRecentSearchQuery({
      lang: "en-US",
      query: "  Arrival  ",
    });
    pushRecentSearchQuery({
      lang: "nl-NL",
      query: "arrival",
    });

    expect(readRecentSearches()).toEqual([
      {
        href: "/search/?lang=nl-NL&q=arrival",
        query: "arrival",
      },
    ]);
  });
});
