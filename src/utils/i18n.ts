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
  "auth.disclaimer.aboutHeading": "About Moviestracker",
  "auth.disclaimer.aboutText":
    "Moviestracker is a free, non-commercial personal catalog for discovering and organizing movies and TV series.",
  "auth.disclaimer.agree":
    "I have read and agree to use Moviestracker only in accordance with applicable law and third-party terms.",
  "auth.disclaimer.cancel": "Cancel",
  "auth.disclaimer.close": "Close the use and content notice",
  "auth.disclaimer.continueWithProvider": "Agree and continue with {provider}",
  "auth.disclaimer.jacredHeading": "JacRed",
  "auth.disclaimer.jacredLink": "Visit JacRed",
  "auth.disclaimer.jacredText":
    "Torrent search results, including magnet links and source-page links, are supplied by the third-party JacRed API (jacred.su). Moviestracker does not create or verify these listings and does not permanently store their underlying .torrent files or media.",
  "auth.disclaimer.noHostingHeading": "No media hosting",
  "auth.disclaimer.noHostingText":
    "This web app does not host, upload, seed, or distribute video files. Playback and download actions are handled by third-party services or a TorrServer endpoint configured by the user.",
  "auth.disclaimer.responsibility":
    "BitTorrent technology has lawful and unlawful uses. Access only material you own, that is in the public domain, or that you are otherwise authorized to use. You are responsible for complying with the laws and third-party terms that apply in your jurisdiction.",
  "auth.disclaimer.subtitle":
    "Review how Moviestracker provides information and handles torrent links.",
  "auth.disclaimer.title": "Before you sign in",
  "auth.disclaimer.tmdbAttribution":
    "This product uses the TMDB API but is not endorsed or certified by TMDB.",
  "auth.disclaimer.tmdbHeading": "The Movie Database (TMDB)",
  "auth.disclaimer.tmdbLink": "Visit TMDB",
  "auth.disclaimer.tmdbLogo": "TMDB logo",
  "auth.disclaimer.tmdbText":
    "Movie and TV metadata, images, and related media are retrieved through the TMDB API.",
  "search.startsAfterCharacters": "Use at least {minimum} characters.",
  "search.becomesAvailableAfterCharacters":
    "Enter at least {minimum} characters.",
  "search.tryBroader": "Try a broader title, name, or spelling.",
  "search.tooShort":
    "Search starts after {minimum} characters. Add {remaining} more {remainingWord} and submit again.",
  "filters.reset": "Reset filters",
  "media.productionDetails": "Production details",
  "media.episodeStatus": "Episode status",
  "media.socialMedia": "Social media",
  langDaysUntilNextEpisode: "Days until next episode",
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
  "auth.disclaimer.aboutHeading": "О Moviestracker",
  "auth.disclaimer.aboutText":
    "Moviestracker — бесплатный некоммерческий персональный каталог для поиска и организации информации о фильмах и сериалах.",
  "auth.disclaimer.agree":
    "Я прочитал(а) уведомление и согласен(на) использовать Moviestracker только в соответствии с применимым законодательством и условиями сторонних сервисов.",
  "auth.disclaimer.cancel": "Отмена",
  "auth.disclaimer.close": "Закрыть уведомление об использовании и контенте",
  "auth.disclaimer.continueWithProvider":
    "Согласиться и продолжить через {provider}",
  "auth.disclaimer.jacredHeading": "JacRed",
  "auth.disclaimer.jacredLink": "Открыть JacRed",
  "auth.disclaimer.jacredText":
    "Результаты поиска торрентов, включая magnet-ссылки и ссылки на страницы источников, предоставляются сторонним API JacRed (jacred.su). Moviestracker не создаёт и не проверяет эти списки и не хранит постоянно исходные .torrent-файлы или медиаконтент.",
  "auth.disclaimer.noHostingHeading": "Без размещения медиаконтента",
  "auth.disclaimer.noHostingText":
    "Веб-приложение не размещает, не загружает, не раздаёт и не распространяет видеофайлы. Воспроизведение и загрузка выполняются сторонними сервисами или сервером TorrServer, который настроил пользователь.",
  "auth.disclaimer.responsibility":
    "Технология BitTorrent может использоваться законно и незаконно. Получайте доступ только к материалам, которыми вы владеете, находящимся в общественном достоянии или на использование которых у вас есть разрешение. Вы обязаны соблюдать законодательство и условия сторонних сервисов, применимые в вашей юрисдикции.",
  "auth.disclaimer.subtitle":
    "Ознакомьтесь с тем, как Moviestracker получает информацию и обрабатывает торрент-ссылки.",
  "auth.disclaimer.title": "Перед входом",
  "auth.disclaimer.tmdbAttribution":
    "This product uses the TMDB API but is not endorsed or certified by TMDB.",
  "auth.disclaimer.tmdbHeading": "The Movie Database (TMDB)",
  "auth.disclaimer.tmdbLink": "Открыть TMDB",
  "auth.disclaimer.tmdbLogo": "Логотип TMDB",
  "auth.disclaimer.tmdbText":
    "Метаданные, изображения и связанные материалы о фильмах и сериалах приложение получает через API TMDB.",
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
  "media.socialMedia": "Социальные сети",
  langDaysUntilNextEpisode: "Дней до следующего эпизода",
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
