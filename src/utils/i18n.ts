import {
  englishMessages,
  russianMessages,
  uiEnglishMessages,
  uiRussianMessages,
} from "./messages";

export type Locale = "en-US" | "ru-RU";

export const DEFAULT_LOCALE: Locale = "en-US";

export const normalizeLocale = (locale: string | null | undefined): Locale =>
  locale === "ru-RU" ? "ru-RU" : DEFAULT_LOCALE;

const enUS = {
  ...englishMessages,
  ...uiEnglishMessages,
  "feed.sectionUnavailable": "{section} is temporarily unavailable.",
  "feed.tryAgain": "Refresh the page or try again shortly.",
  "imdb.notFound": "IMDb not found",
  "imdb.unavailable": "IMDb unavailable",
  "pagination.loaded": "{count} loaded",
  "pagination.pageOf": "Page {page} of {total}",
  "search.matches": "{count} matches",
  "media.moviesCount": "Movies ({count})",
  "media.seriesCount": "Series ({count})",
  "sort.highestRated": "Highest Rated",
  "sort.newestReleases": "Newest Releases",
  "sort.oldestReleases": "Oldest Releases",
  "sort.newestPremieres": "Newest Premieres",
  "sort.oldestPremieres": "Oldest Premieres",
  "sort.popularity": "Popularity",
  "torrserver.viewedStorage": "Viewed storage: {storage}",
  "torrserver.alreadyExists": "TorrServer {server} is already in the list!",
  "torrserver.added": "TorrServer {server} has been added.",
  "torrserver.removeServerConfirm": "Remove TorrServer {server} from this browser?",
  "torrserver.deleted": "TorrServer {server} has been deleted.",
  "torrserver.dropActiveConfirm": "Drop \"{title}\" from active playback?",
  "torrserver.removeTorrentConfirm": "Remove \"{title}\" from TorrServer?",
  "torrserver.runtimeSettings": "Preload {preload}% · Read ahead {readAhead}% · Connections {connections}",
  "torrserver.storageSummary": "Settings: {settings} · Viewed: {viewed} ({count})",
  "torrserver.openDetails": "Open details for {title}",
  "torrserver.openPlaylist": "Open playlist for {title}",
  "torrserver.openMagnet": "Open magnet link for {title}",
  "torrserver.activatingPeers": "Activating · Peers: {peers}",
  "torrserver.connected": "Connected",
  "torrserver.connecting": "Checking",
  "torrserver.error": "Failed",
  "torrserver.idle": "Waiting",
} as const;

type MessageKey = keyof typeof enUS;
type MessageCatalog = { [Key in MessageKey]: string };

const ruRU = {
  ...russianMessages,
  ...uiRussianMessages,
  "feed.sectionUnavailable": "Раздел «{section}» временно недоступен.",
  "feed.tryAgain": "Обновите страницу или повторите попытку чуть позже.",
  "imdb.notFound": "IMDb не найден",
  "imdb.unavailable": "IMDb недоступен",
  "pagination.loaded": "Загружено: {count}",
  "pagination.pageOf": "Страница {page} из {total}",
  "search.matches": "{count} совпадений",
  "media.moviesCount": "Фильмы ({count})",
  "media.seriesCount": "Сериалы ({count})",
  "sort.highestRated": "Сначала высокий рейтинг",
  "sort.newestReleases": "Сначала новые релизы",
  "sort.oldestReleases": "Сначала старые релизы",
  "sort.newestPremieres": "Сначала новые премьеры",
  "sort.oldestPremieres": "Сначала старые премьеры",
  "sort.popularity": "Популярность",
  "torrserver.viewedStorage": "Хранилище просмотренного: {storage}",
  "torrserver.alreadyExists": "TorrServer {server} уже есть в списке!",
  "torrserver.added": "TorrServer {server} добавлен.",
  "torrserver.removeServerConfirm": "Удалить TorrServer {server} из этого браузера?",
  "torrserver.deleted": "TorrServer {server} удален.",
  "torrserver.dropActiveConfirm": "Остановить \"{title}\" в активном воспроизведении?",
  "torrserver.removeTorrentConfirm": "Удалить \"{title}\" из TorrServer?",
  "torrserver.runtimeSettings": "Предзагрузка {preload}% · Чтение вперед {readAhead}% · Подключения {connections}",
  "torrserver.storageSummary": "Настройки: {settings} · Просмотры: {viewed} ({count})",
  "torrserver.openDetails": "Открыть детали: {title}",
  "torrserver.openPlaylist": "Открыть плейлист: {title}",
  "torrserver.openMagnet": "Открыть magnet ссылку: {title}",
  "torrserver.activatingPeers": "Активация · Пиры: {peers}",
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
