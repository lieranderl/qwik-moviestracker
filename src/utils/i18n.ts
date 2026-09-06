export type Locale = "en-US" | "ru-RU";

export const DEFAULT_LOCALE: Locale = "en-US";

export const normalizeLocale = (locale: string | null | undefined): Locale =>
  locale === "ru-RU" ? "ru-RU" : DEFAULT_LOCALE;

const enUS = {
  ...legacyEnglishMessages,
  "feed.sectionUnavailable": "{section} is temporarily unavailable.",
  "feed.tryAgain": "Refresh the page or try again shortly.",
  "imdb.notFound": "IMDb not found",
  "imdb.unavailable": "IMDb unavailable",
  "pagination.loaded": "{count} loaded",
  "torrserver.connected": "Connected",
  "torrserver.connecting": "Checking",
  "torrserver.error": "Failed",
  "torrserver.idle": "Waiting",
} as const;

type MessageKey = keyof typeof enUS;
type MessageCatalog = { [Key in MessageKey]: string };

const ruRU = {
  ...legacyRussianMessages,
  "feed.sectionUnavailable": "Раздел «{section}» временно недоступен.",
  "feed.tryAgain": "Обновите страницу или повторите попытку чуть позже.",
  "imdb.notFound": "IMDb не найден",
  "imdb.unavailable": "IMDb недоступен",
  "pagination.loaded": "Загружено: {count}",
  "torrserver.connected": "Подключено",
  "torrserver.connecting": "Проверка",
  "torrserver.error": "Ошибка",
  "torrserver.idle": "Ожидание",
} as const satisfies MessageCatalog;

const catalogs: Record<Locale, MessageCatalog> = {
  "en-US": enUS,
  "ru-RU": ruRU,
};

type MessageParameters = Record<string, number | string>;

export const message = (
  locale: string | null | undefined,
  key: MessageKey,
  parameters: MessageParameters = {},
): string =>
  catalogs[normalizeLocale(locale)][key].replace(
    /\{([a-zA-Z][a-zA-Z0-9]*)\}/g,
    (placeholder, parameter: string) =>
      parameter in parameters ? String(parameters[parameter]) : placeholder,
  );

export type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

export const pluralMessage = (
  locale: string | null | undefined,
  count: number,
  forms: Record<Locale, PluralMessage>,
  parameters: MessageParameters = {},
): string => {
  const normalized = normalizeLocale(locale);
  const category = new Intl.PluralRules(normalized).select(count);
  const template = forms[normalized][category] ?? forms[normalized].other;
  return template
    .replace(/\{count\}/g, String(count))
    .replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, parameter: string) =>
      parameter in parameters ? String(parameters[parameter]) : placeholder,
    );
};

export type { MessageKey };
import { legacyEnglishMessages, legacyRussianMessages } from "./messages";
