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
  "torrserver.removeServerConfirm":
    "Remove TorrServer {server} from this browser?",
  "torrserver.deleted": "TorrServer {server} has been deleted.",
  "torrserver.dropActiveConfirm": 'Drop "{title}" from active playback?',
  "torrserver.removeTorrentConfirm": 'Remove "{title}" from TorrServer?',
  "torrserver.runtimeSettings":
    "Preload {preload}% · Read ahead {readAhead}% · Connections {connections}",
  "torrserver.storageSummary":
    "Settings: {settings} · Viewed: {viewed} ({count})",
  "torrserver.openDetails": "Open details for {title}",
  "torrserver.openPlaylist": "Open playlist for {title}",
  "torrserver.openMagnet": "Open magnet link for {title}",
  "torrserver.activatingPeers": "Activating · Peers: {peers}",
  "torrserver.connected": "Connected",
  "torrserver.connecting": "Checking",
  "torrserver.error": "Failed",
  "torrserver.idle": "Waiting",
  "torrserver.tools.addTorrentByLink": "Add torrent by link",
  "torrserver.tools.torrentOrMagnetLink": "Torrent or magnet link",
  "torrserver.tools.torrentOrMagnetPlaceholder":
    "magnet:?xt=... or http(s)://...",
  "torrserver.tools.title": "Title",
  "torrserver.tools.optionalTitle": "Optional title",
  "torrserver.tools.category": "Category",
  "torrserver.tools.other": "Other",
  "torrserver.tools.movie": "Movie",
  "torrserver.tools.tv": "TV",
  "torrserver.tools.music": "Music",
  "torrserver.tools.saveInDatabase": "Save in DB",
  "torrserver.tools.adding": "Adding...",
  "torrserver.tools.addLink": "Add link",
  "torrserver.tools.uploadTorrentFile": "Upload .torrent file",
  "torrserver.tools.torrentFile": ".torrent file",
  "torrserver.tools.noFileSelected": "No file selected",
  "torrserver.tools.uploading": "Uploading...",
  "torrserver.tools.upload": "Upload",
  "torrserver.tools.searchAndDiagnostics": "Search and diagnostics",
  "torrserver.tools.searchQuery": "Search query",
  "torrserver.tools.searching": "Searching...",
  "torrserver.tools.searchResults": "Results from {source}: {count}",
  "torrserver.tools.searchHint":
    "Run /search or /torznab to load results here.",
  "torrserver.tools.seeders": "seeders",
  "torrserver.tools.add": "Add",
  "torrserver.tools.statsHint":
    "Statistics text from /stat will appear here after connection.",
  "torrserver.tools.provideLink": "Provide a torrent or magnet link.",
  "torrserver.tools.linkSent": "Link sent to TorrServer.",
  "torrserver.tools.addLinkFailed": "Could not add the link.",
  "torrserver.tools.uploadSucceeded": "Torrent uploaded.",
  "torrserver.tools.uploadFailed": "Upload failed.",
  "torrserver.tools.searchFailed": "Search failed.",
  "torrserver.tools.resultMissingLink": "Result has no torrent link.",
  "torrserver.tools.resultAdded": "Result added to TorrServer.",
  "torrserver.tools.addResultFailed": "Could not add the result.",
  "torrserver.tools.close": "Close API tools",
  "torrserver.tools.heading": "Tools",
  "torrserver.tools.subtitle": "Add torrents, search, and manage playlists.",
  "auth.signInWithProvider": "Sign in with {provider}",
  "search.startsAfterCharacters": "Use at least {minimum} characters.",
  "search.becomesAvailableAfterCharacters":
    "Enter at least {minimum} characters.",
  "search.tryBroader": "Try a broader title, name, or spelling.",
  "search.tooShort":
    "Search starts after {minimum} characters. Add {remaining} more {remainingWord} and submit again.",
  "filters.reset": "Reset filters",
  "media.productionDetails": "Production details",
  "media.episodeStatus": "Episode status",
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
  "torrserver.removeServerConfirm":
    "Удалить TorrServer {server} из этого браузера?",
  "torrserver.deleted": "TorrServer {server} удален.",
  "torrserver.dropActiveConfirm":
    'Остановить "{title}" в активном воспроизведении?',
  "torrserver.removeTorrentConfirm": 'Удалить "{title}" из TorrServer?',
  "torrserver.runtimeSettings":
    "Предзагрузка {preload}% · Чтение вперед {readAhead}% · Подключения {connections}",
  "torrserver.storageSummary":
    "Настройки: {settings} · Просмотры: {viewed} ({count})",
  "torrserver.openDetails": "Открыть детали: {title}",
  "torrserver.openPlaylist": "Открыть плейлист: {title}",
  "torrserver.openMagnet": "Открыть magnet ссылку: {title}",
  "torrserver.activatingPeers": "Активация · Пиры: {peers}",
  "torrserver.connected": "Подключено",
  "torrserver.connecting": "Проверка",
  "torrserver.error": "Ошибка",
  "torrserver.idle": "Ожидание",
  "torrserver.tools.addTorrentByLink": "Добавить торрент по ссылке",
  "torrserver.tools.torrentOrMagnetLink": "Torrent или magnet ссылка",
  "torrserver.tools.torrentOrMagnetPlaceholder":
    "magnet:?xt=... или http(s)://...",
  "torrserver.tools.title": "Заголовок",
  "torrserver.tools.optionalTitle": "Необязательный заголовок",
  "torrserver.tools.category": "Категория",
  "torrserver.tools.other": "Другое",
  "torrserver.tools.movie": "Фильм",
  "torrserver.tools.tv": "Сериал",
  "torrserver.tools.music": "Музыка",
  "torrserver.tools.saveInDatabase": "Сохранить в БД",
  "torrserver.tools.adding": "Добавление...",
  "torrserver.tools.addLink": "Добавить ссылку",
  "torrserver.tools.uploadTorrentFile": "Загрузить .torrent файл",
  "torrserver.tools.torrentFile": ".torrent файл",
  "torrserver.tools.noFileSelected": "Файл не выбран",
  "torrserver.tools.uploading": "Загрузка...",
  "torrserver.tools.upload": "Загрузить",
  "torrserver.tools.searchAndDiagnostics": "Поиск и диагностика",
  "torrserver.tools.searchQuery": "Поисковый запрос",
  "torrserver.tools.searching": "Поиск...",
  "torrserver.tools.searchResults": "Результаты из {source}: {count}",
  "torrserver.tools.searchHint":
    "Запустите /search или /torznab, чтобы увидеть результаты здесь.",
  "torrserver.tools.seeders": "сидеров",
  "torrserver.tools.add": "Добавить",
  "torrserver.tools.statsHint":
    "Текст статистики из /stat появится здесь после подключения.",
  "torrserver.tools.provideLink": "Укажите торрент или magnet ссылку.",
  "torrserver.tools.linkSent": "Ссылка отправлена в TorrServer.",
  "torrserver.tools.addLinkFailed": "Не удалось добавить ссылку.",
  "torrserver.tools.uploadSucceeded": "Торрент загружен.",
  "torrserver.tools.uploadFailed": "Загрузка не удалась.",
  "torrserver.tools.searchFailed": "Ошибка поиска.",
  "torrserver.tools.resultMissingLink": "В результате нет торрент-ссылки.",
  "torrserver.tools.resultAdded": "Результат добавлен в TorrServer.",
  "torrserver.tools.addResultFailed": "Не удалось добавить результат.",
  "torrserver.tools.close": "Закрыть API-инструменты",
  "torrserver.tools.heading": "Инструменты",
  "torrserver.tools.subtitle":
    "Добавляйте торренты, ищите и управляйте плейлистами.",
  "auth.signInWithProvider": "Войти через {provider}",
  "search.startsAfterCharacters": "Используйте не менее {minimum} символов.",
  "search.becomesAvailableAfterCharacters":
    "Введите не менее {minimum} символов.",
  "search.tryBroader":
    "Попробуйте более общее название, имя человека или другое написание.",
  "search.tooShort":
    "Поиск доступен после {minimum} символов. Добавьте еще {remaining} {remainingWord} и отправьте снова.",
  "filters.reset": "Сбросить фильтры",
  "media.productionDetails": "Детали производства",
  "media.episodeStatus": "Статус эпизодов",
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
