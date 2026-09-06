import { describe, expect, test } from "bun:test";
import { message, normalizeLocale, pluralMessage } from "./i18n";
import { langBudget, langSignInWithProvider } from "./languages";

describe("i18n message catalogs", () => {
  test("falls back explicitly to English for unsupported locales", () => {
    expect(normalizeLocale("de-DE")).toBe("en-US");
    expect(message("de-DE", "imdb.unavailable")).toBe("IMDb unavailable");
    expect(langBudget("de-DE")).toBe("Budget");
    expect(langSignInWithProvider("de-DE", "google")).toBe(
      "Sign in with Google",
    );
  });

  test("interpolates typed catalog messages", () => {
    expect(
      message("ru-RU", "feed.sectionUnavailable", { section: "Новинки" }),
    ).toBe("Раздел «Новинки» временно недоступен.");
  });

  test("uses Intl.PluralRules for English and Russian forms", () => {
    const forms = {
      "en-US": { one: "{count} result", other: "{count} results" },
      "ru-RU": {
        one: "{count} результат",
        few: "{count} результата",
        many: "{count} результатов",
        other: "{count} результата",
      },
    } as const;
    expect(pluralMessage("en-US", 1, forms)).toBe("1 result");
    expect(pluralMessage("en-US", 2, forms)).toBe("2 results");
    expect(pluralMessage("ru-RU", 2, forms)).toBe("2 результата");
    expect(pluralMessage("ru-RU", 11, forms)).toBe("11 результатов");
  });
});
