import { message, normalizeLocale } from "./i18n";

export const languages = [
  { english_name: "No Language", iso_639_1: "xx" },
  { english_name: "Afar", iso_639_1: "aa" },
  { english_name: "Afrikaans", iso_639_1: "af" },
  { english_name: "Akan", iso_639_1: "ak" },
  { english_name: "Aragonese", iso_639_1: "an" },
  { english_name: "Assamese", iso_639_1: "as" },
  { english_name: "Avaric", iso_639_1: "av" },
  { english_name: "Avestan", iso_639_1: "ae" },
  { english_name: "Aymara", iso_639_1: "ay" },
  { english_name: "Azerbaijani", iso_639_1: "az" },
  { english_name: "Bashkir", iso_639_1: "ba" },
  { english_name: "Bambara", iso_639_1: "bm" },
  { english_name: "Bislama", iso_639_1: "bi" },
  { english_name: "Tibetan", iso_639_1: "bo" },
  { english_name: "Breton", iso_639_1: "br" },
  { english_name: "Catalan", iso_639_1: "ca" },
  { english_name: "Czech", iso_639_1: "cs" },
  { english_name: "Chechen", iso_639_1: "ce" },
  { english_name: "Slavic", iso_639_1: "cu" },
  { english_name: "Chuvash", iso_639_1: "cv" },
  { english_name: "Cornish", iso_639_1: "kw" },
  { english_name: "Corsican", iso_639_1: "co" },
  { english_name: "Cree", iso_639_1: "cr" },
  { english_name: "Welsh", iso_639_1: "cy" },
  { english_name: "Danish", iso_639_1: "da" },
  { english_name: "German", iso_639_1: "de" },
  { english_name: "Divehi", iso_639_1: "dv" },
  { english_name: "Dzongkha", iso_639_1: "dz" },
  { english_name: "Esperanto", iso_639_1: "eo" },
  { english_name: "Estonian", iso_639_1: "et" },
  { english_name: "Basque", iso_639_1: "eu" },
  { english_name: "Faroese", iso_639_1: "fo" },
  { english_name: "Fijian", iso_639_1: "fj" },
  { english_name: "Finnish", iso_639_1: "fi" },
  { english_name: "French", iso_639_1: "fr" },
  { english_name: "Frisian", iso_639_1: "fy" },
  { english_name: "Fulah", iso_639_1: "ff" },
  { english_name: "Gaelic", iso_639_1: "gd" },
  { english_name: "Irish", iso_639_1: "ga" },
  { english_name: "Galician", iso_639_1: "gl" },
  { english_name: "Manx", iso_639_1: "gv" },
  { english_name: "Guarani", iso_639_1: "gn" },
  { english_name: "Gujarati", iso_639_1: "gu" },
  { english_name: "Haitian; Haitian Creole", iso_639_1: "ht" },
  { english_name: "Hausa", iso_639_1: "ha" },
  { english_name: "Serbo-Croatian", iso_639_1: "sh" },
  { english_name: "Herero", iso_639_1: "hz" },
  { english_name: "Hiri Motu", iso_639_1: "ho" },
  { english_name: "Croatian", iso_639_1: "hr" },
  { english_name: "Hungarian", iso_639_1: "hu" },
  { english_name: "Igbo", iso_639_1: "ig" },
  { english_name: "Ido", iso_639_1: "io" },
  { english_name: "Yi", iso_639_1: "ii" },
  { english_name: "Inuktitut", iso_639_1: "iu" },
  { english_name: "Interlingue", iso_639_1: "ie" },
  { english_name: "Interlingua", iso_639_1: "ia" },
  { english_name: "Indonesian", iso_639_1: "id" },
  { english_name: "Inupiaq", iso_639_1: "ik" },
  { english_name: "Icelandic", iso_639_1: "is" },
  { english_name: "Italian", iso_639_1: "it" },
  { english_name: "Javanese", iso_639_1: "jv" },
  { english_name: "Japanese", iso_639_1: "ja" },
  { english_name: "Kalaallisut", iso_639_1: "kl" },
  { english_name: "Kannada", iso_639_1: "kn" },
  { english_name: "Kashmiri", iso_639_1: "ks" },
  { english_name: "Kanuri", iso_639_1: "kr" },
  { english_name: "Kazakh", iso_639_1: "kk" },
  { english_name: "Khmer", iso_639_1: "km" },
  { english_name: "Kikuyu", iso_639_1: "ki" },
  { english_name: "Kinyarwanda", iso_639_1: "rw" },
  { english_name: "Kirghiz", iso_639_1: "ky" },
  { english_name: "Komi", iso_639_1: "kv" },
  { english_name: "Kongo", iso_639_1: "kg" },
  { english_name: "Korean", iso_639_1: "ko" },
  { english_name: "Kuanyama", iso_639_1: "kj" },
  { english_name: "Kurdish", iso_639_1: "ku" },
  { english_name: "Lao", iso_639_1: "lo" },
  { english_name: "Latin", iso_639_1: "la" },
  { english_name: "Latvian", iso_639_1: "lv" },
  { english_name: "Limburgish", iso_639_1: "li" },
  { english_name: "Lingala", iso_639_1: "ln" },
  { english_name: "Lithuanian", iso_639_1: "lt" },
  { english_name: "Letzeburgesch", iso_639_1: "lb" },
  { english_name: "Luba-Katanga", iso_639_1: "lu" },
  { english_name: "Ganda", iso_639_1: "lg" },
  { english_name: "Marshall", iso_639_1: "mh" },
  { english_name: "Malayalam", iso_639_1: "ml" },
  { english_name: "Marathi", iso_639_1: "mr" },
  { english_name: "Malagasy", iso_639_1: "mg" },
  { english_name: "Maltese", iso_639_1: "mt" },
  { english_name: "Moldavian", iso_639_1: "mo" },
  { english_name: "Mongolian", iso_639_1: "mn" },
  { english_name: "Maori", iso_639_1: "mi" },
  { english_name: "Malay", iso_639_1: "ms" },
  { english_name: "Burmese", iso_639_1: "my" },
  { english_name: "Nauru", iso_639_1: "na" },
  { english_name: "Navajo", iso_639_1: "nv" },
  { english_name: "Ndebele", iso_639_1: "nr" },
  { english_name: "Ndebele", iso_639_1: "nd" },
  { english_name: "Ndonga", iso_639_1: "ng" },
  { english_name: "Nepali", iso_639_1: "ne" },
  { english_name: "Dutch", iso_639_1: "nl" },
  { english_name: "Norwegian Nynorsk", iso_639_1: "nn" },
  { english_name: "Norwegian Bokmål", iso_639_1: "nb" },
  { english_name: "Norwegian", iso_639_1: "no" },
  { english_name: "Chichewa; Nyanja", iso_639_1: "ny" },
  { english_name: "Occitan", iso_639_1: "oc" },
  { english_name: "Ojibwa", iso_639_1: "oj" },
  { english_name: "Oriya", iso_639_1: "or" },
  { english_name: "Oromo", iso_639_1: "om" },
  { english_name: "Ossetian; Ossetic", iso_639_1: "os" },
  { english_name: "Pali", iso_639_1: "pi" },
  { english_name: "Polish", iso_639_1: "pl" },
  { english_name: "Portuguese", iso_639_1: "pt" },
  { english_name: "Quechua", iso_639_1: "qu" },
  { english_name: "Raeto-Romance", iso_639_1: "rm" },
  { english_name: "Romanian", iso_639_1: "ro" },
  { english_name: "Rundi", iso_639_1: "rn" },
  { english_name: "Russian", iso_639_1: "ru" },
  { english_name: "Sango", iso_639_1: "sg" },
  { english_name: "Sanskrit", iso_639_1: "sa" },
  { english_name: "Sinhalese", iso_639_1: "si" },
  { english_name: "Slovak", iso_639_1: "sk" },
  { english_name: "Slovenian", iso_639_1: "sl" },
  { english_name: "Northern Sami", iso_639_1: "se" },
  { english_name: "Samoan", iso_639_1: "sm" },
  { english_name: "Shona", iso_639_1: "sn" },
  { english_name: "Sindhi", iso_639_1: "sd" },
  { english_name: "Somali", iso_639_1: "so" },
  { english_name: "Sotho", iso_639_1: "st" },
  { english_name: "Spanish", iso_639_1: "es" },
  { english_name: "Albanian", iso_639_1: "sq" },
  { english_name: "Sardinian", iso_639_1: "sc" },
  { english_name: "Serbian", iso_639_1: "sr" },
  { english_name: "Swati", iso_639_1: "ss" },
  { english_name: "Sundanese", iso_639_1: "su" },
  { english_name: "Swahili", iso_639_1: "sw" },
  { english_name: "Swedish", iso_639_1: "sv" },
  { english_name: "Tahitian", iso_639_1: "ty" },
  { english_name: "Tamil", iso_639_1: "ta" },
  { english_name: "Tatar", iso_639_1: "tt" },
  { english_name: "Telugu", iso_639_1: "te" },
  { english_name: "Tajik", iso_639_1: "tg" },
  { english_name: "Tagalog", iso_639_1: "tl" },
  { english_name: "Thai", iso_639_1: "th" },
  { english_name: "Tigrinya", iso_639_1: "ti" },
  { english_name: "Tonga", iso_639_1: "to" },
  { english_name: "Tswana", iso_639_1: "tn" },
  { english_name: "Tsonga", iso_639_1: "ts" },
  { english_name: "Turkmen", iso_639_1: "tk" },
  { english_name: "Turkish", iso_639_1: "tr" },
  { english_name: "Twi", iso_639_1: "tw" },
  { english_name: "Uighur", iso_639_1: "ug" },
  { english_name: "Ukrainian", iso_639_1: "uk" },
  { english_name: "Urdu", iso_639_1: "ur" },
  { english_name: "Uzbek", iso_639_1: "uz" },
  { english_name: "Venda", iso_639_1: "ve" },
  { english_name: "Vietnamese", iso_639_1: "vi" },
  { english_name: "Volapük", iso_639_1: "vo" },
  { english_name: "Walloon", iso_639_1: "wa" },
  { english_name: "Wolof", iso_639_1: "wo" },
  { english_name: "Xhosa", iso_639_1: "xh" },
  { english_name: "Yiddish", iso_639_1: "yi" },
  { english_name: "Zhuang", iso_639_1: "za" },
  { english_name: "Zulu", iso_639_1: "zu" },
  { english_name: "Abkhazian", iso_639_1: "ab" },
  { english_name: "Mandarin", iso_639_1: "zh" },
  { english_name: "Pushto", iso_639_1: "ps" },
  { english_name: "Amharic", iso_639_1: "am" },
  { english_name: "Arabic", iso_639_1: "ar" },
  { english_name: "Bulgarian", iso_639_1: "bg" },
  { english_name: "Cantonese", iso_639_1: "cn" },
  { english_name: "Macedonian", iso_639_1: "mk" },
  { english_name: "Greek", iso_639_1: "el" },
  { english_name: "Persian", iso_639_1: "fa" },
  { english_name: "Hebrew", iso_639_1: "he" },
  { english_name: "Hindi", iso_639_1: "hi" },
  { english_name: "Armenian", iso_639_1: "hy" },
  { english_name: "English", iso_639_1: "en" },
  { english_name: "Ewe", iso_639_1: "ee" },
  { english_name: "Georgian", iso_639_1: "ka" },
  { english_name: "Punjabi", iso_639_1: "pa" },
  { english_name: "Bengali", iso_639_1: "bn" },
  { english_name: "Bosnian", iso_639_1: "bs" },
  { english_name: "Chamorro", iso_639_1: "ch" },
  { english_name: "Belarusian", iso_639_1: "be" },
  { english_name: "Yoruba", iso_639_1: "yo" },
];

const formatCountWord = (
  lang: string,
  count: number,
  enOne: string,
  enMany: string,
  ruOne: string,
  ruFew: string,
  ruMany: string,
) => {
  const locale = normalizeLocale(lang);
  const category = new Intl.PluralRules(locale).select(count);
  if (locale === "en-US") return category === "one" ? enOne : enMany;
  const russianForms: Record<Intl.LDMLPluralRule, string> = {
    zero: ruMany,
    one: ruOne,
    two: ruMany,
    few: ruFew,
    many: ruMany,
    other: ruMany,
  };
  return russianForms[category];
};

const formatCountLabel = (
  lang: string,
  count: number,
  enOne: string,
  enMany: string,
  ruOne: string,
  ruFew: string,
  ruMany: string,
) =>
  `${count} ${formatCountWord(lang, count, enOne, enMany, ruOne, ruFew, ruMany)}`;

export const langText = (lang: string, english: string, russian: string) =>
  normalizeLocale(lang) === "ru-RU" ? russian : english;

export const langCountWord = (
  lang: string,
  count: number,
  englishSingular: string,
  englishPlural: string,
  russianOne: string,
  russianFew: string,
  russianMany: string,
) => {
  return formatCountWord(
    lang,
    count,
    englishSingular,
    englishPlural,
    russianOne,
    russianFew,
    russianMany,
  );
};

export const langCountLabel = (
  lang: string,
  count: number,
  englishSingular: string,
  englishPlural: string,
  russianOne: string,
  russianFew: string,
  russianMany: string,
) =>
  `${count} ${langCountWord(lang, count, englishSingular, englishPlural, russianOne, russianFew, russianMany)}`;

/** @deprecated Prefer message(locale, key). */
export const langBudget = (lang: string) => message(lang, "langBudget");

/** @deprecated Prefer message(locale, key). */
export const langRevenue = (lang: string) => message(lang, "langRevenue");

/** @deprecated Prefer message(locale, key). */
export const langMovies = (lang: string) => message(lang, "langMovies");

/** @deprecated Prefer message(locale, key). */
export const langSeries = (lang: string) => message(lang, "langSeries");

/** @deprecated Prefer message(locale, key). */
export const langPeople = (lang: string) => message(lang, "langPeople");

/** @deprecated Prefer message(locale, key). */
export const langSearch = (lang: string) => message(lang, "langSearch");

/** @deprecated Prefer message(locale, key). */
export const langTorrServer = (lang: string) => message(lang, "langTorrServer");

/** @deprecated Prefer message(locale, key). */
export const langExploreAll = (lang: string) => message(lang, "langExploreAll");

/** @deprecated Prefer message(locale, key). */
export const langLatestMovies = (lang: string) =>
  message(lang, "langLatestMovies");

/** @deprecated Prefer message(locale, key). */
export const langTrendingMovies = (lang: string) =>
  message(lang, "langTrendingMovies");

/** @deprecated Prefer message(locale, key). */
export const langNowPlayingMovies = (lang: string) =>
  message(lang, "langNowPlayingMovies");

/** @deprecated Prefer message(locale, key). */
export const langUpcomingMovies = (lang: string) =>
  message(lang, "langUpcomingMovies");

/** @deprecated Prefer message(locale, key). */
export const langPopularMovies = (lang: string) =>
  message(lang, "langPopularMovies");

/** @deprecated Prefer message(locale, key). */
export const langTrengingTVShows = (lang: string) =>
  message(lang, "langTrengingTVShows");

/** @deprecated Prefer message(locale, key). */
export const langAiringTodayTvShows = (lang: string) =>
  message(lang, "langAiringTodayTvShows");

/** @deprecated Prefer message(locale, key). */
export const langOnTheAirTvShows = (lang: string) =>
  message(lang, "langOnTheAirTvShows");

/** @deprecated Prefer message(locale, key). */
export const langPopularTvShows = (lang: string) =>
  message(lang, "langPopularTvShows");

/** @deprecated Prefer message(locale, key). */
export const langLatestHDR10Movies = (lang: string) =>
  message(lang, "langLatestHDR10Movies");

/** @deprecated Prefer message(locale, key). */
export const langLatestDolbyVisionMovies = (lang: string) =>
  message(lang, "langLatestDolbyVisionMovies");

/** @deprecated Prefer message(locale, key). */
export const langTopRatedTvShows = (lang: string) =>
  message(lang, "langTopRatedTvShows");

/** @deprecated Prefer message(locale, key). */
export const langAll = (lang: string) => message(lang, "langAll");

/** @deprecated Prefer message(locale, key). */
export const langNoResults = (lang: string) => message(lang, "langNoResults");

/** @deprecated Prefer message(locale, key). */
export const langSearchResults = (lang: string) =>
  message(lang, "langSearchResults");

/** @deprecated Prefer message(locale, key). */
export const langResults = (lang: string) => message(lang, "langResults");

/** @deprecated Prefer message(locale, key). */
export const langSingOut = (lang: string) => message(lang, "langSingOut");

/** @deprecated Prefer message(locale, key). */
export const langAddNewTorrServerURL = (lang: string) =>
  message(lang, "langAddNewTorrServerURL");

/** @deprecated Prefer message(locale, key). */
export const langTorrents = (lang: string) => message(lang, "langTorrents");

/** @deprecated Prefer message(locale, key). */
export const langTrailers = (lang: string) => message(lang, "langTrailers");

/** @deprecated Prefer message(locale, key). */
export const langActors = (lang: string) => message(lang, "langActors");

/** @deprecated Prefer message(locale, key). */
export const langCrew = (lang: string) => message(lang, "langCrew");
/** @deprecated Prefer message(locale, key). */
export const langCollectionMovies = (lang: string) =>
  message(lang, "langCollectionMovies");
/** @deprecated Prefer message(locale, key). */
export const langRecommendedMovies = (lang: string) =>
  message(lang, "langRecommendedMovies");
/** @deprecated Prefer message(locale, key). */
export const langRecommendedTvShows = (lang: string) =>
  message(lang, "langRecommendedTvShows");

/** @deprecated Prefer message(locale, key). */
export const langLastEpisode = (lang: string) =>
  message(lang, "langLastEpisode");

/** @deprecated Prefer message(locale, key). */
export const langTvShowEnded = (lang: string) =>
  message(lang, "langTvShowEnded");

/** @deprecated Prefer message(locale, key). */
export const langNextEpisode = (lang: string) =>
  message(lang, "langNextEpisode");
/** @deprecated Prefer message(locale, key). */
export const langCurrentSeason = (lang: string) =>
  message(lang, "langCurrentSeason");

/** @deprecated Prefer message(locale, key). */
export const langEnded = (lang: string) => message(lang, "langEnded");

/** @deprecated Prefer message(locale, key). */
export const langCreatedby = (lang: string) => message(lang, "langCreatedby");

/** @deprecated Prefer message(locale, key). */
export const langSeasons = (lang: string) => message(lang, "langSeasons");

/** @deprecated Prefer message(locale, key). */
export const langEpisodesCount = (lang: string) =>
  message(lang, "langEpisodesCount");
/** @deprecated Prefer message(locale, key). */
export const langOverview = (lang: string) => message(lang, "langOverview");

/** @deprecated Prefer message(locale, key). */
export const langDate = (lang: string) => message(lang, "langDate");

/** @deprecated Prefer message(locale, key). */
export const langSize = (lang: string) => message(lang, "langSize");

/** @deprecated Prefer message(locale, key). */
export const langSeeds = (lang: string) => message(lang, "langSeeds");

/** @deprecated Prefer message(locale, key). */
export const langLeeches = (lang: string) => message(lang, "langLeeches");

/** @deprecated Prefer message(locale, key). */
export const langSortOn = (lang: string) => message(lang, "langSortOn");

/** @deprecated Prefer message(locale, key). */
export const langFound = (lang: string) => message(lang, "langFound");

/** @deprecated Prefer message(locale, key). */
export const langTorrentov = (lang: string) => message(lang, "langTorrentov");

/** @deprecated Prefer message(locale, key). */
export const langNotFound = (lang: string) => message(lang, "langNotFound");

/** @deprecated Prefer message(locale, key). */
export const langSeason = (lang: string) => message(lang, "langSeason");

/** @deprecated Prefer message(locale, key). */
export const langRelease = (lang: string) => message(lang, "langRelease");

/** @deprecated Prefer message(locale, key). */
export const langCountries = (lang: string) => message(lang, "langCountries");

/** @deprecated Prefer message(locale, key). */
export const langLanguages = (lang: string) => message(lang, "langLanguages");

/** @deprecated Prefer message(locale, key). */
export const langNetworks = (lang: string) => message(lang, "langNetworks");

/** @deprecated Prefer message(locale, key). */
export const langAvailability = (lang: string) =>
  message(lang, "langAvailability");

/** @deprecated Prefer message(locale, key). */
export const langWhereToWatch = (lang: string) =>
  message(lang, "langWhereToWatch");

/** @deprecated Prefer message(locale, key). */
export const langCertification = (lang: string) =>
  message(lang, "langCertification");

/** @deprecated Prefer message(locale, key). */
export const langRegion = (lang: string) => message(lang, "langRegion");

/** @deprecated Prefer message(locale, key). */
export const langStream = (lang: string) => message(lang, "langStream");

/** @deprecated Prefer message(locale, key). */
export const langFree = (lang: string) => message(lang, "langFree");

/** @deprecated Prefer message(locale, key). */
export const langWatchWithAds = (lang: string) =>
  message(lang, "langWatchWithAds");

/** @deprecated Prefer message(locale, key). */
export const langRent = (lang: string) => message(lang, "langRent");

/** @deprecated Prefer message(locale, key). */
export const langBuy = (lang: string) => message(lang, "langBuy");

/** @deprecated Prefer message(locale, key). */
export const langOpenOnTmdb = (lang: string) => message(lang, "langOpenOnTmdb");

/** @deprecated Prefer message(locale, key). */
export const langSupportedByTmdb = (lang: string) =>
  message(lang, "langSupportedByTmdb");

/** @deprecated Prefer message(locale, key). */
export const langQuickFilters = (lang: string) =>
  message(lang, "langQuickFilters");

/** @deprecated Prefer message(locale, key). */
export const langDiscoverMovies = (lang: string) =>
  message(lang, "langDiscoverMovies");

/** @deprecated Prefer message(locale, key). */
export const langDiscoverTv = (lang: string) => message(lang, "langDiscoverTv");

/** @deprecated Prefer message(locale, key). */
export const langApplyFilters = (lang: string) =>
  message(lang, "langApplyFilters");

/** @deprecated Prefer message(locale, key). */
export const langResetFilters = (lang: string) =>
  message(lang, "langResetFilters");

/** @deprecated Prefer message(locale, key). */
export const langSortBy = (lang: string) => message(lang, "langSortBy");

/** @deprecated Prefer message(locale, key). */
export const langMinimumVotes = (lang: string) =>
  message(lang, "langMinimumVotes");

/** @deprecated Prefer message(locale, key). */
export const langReleaseYear = (lang: string) =>
  message(lang, "langReleaseYear");

/** @deprecated Prefer message(locale, key). */
export const langFirstAirYear = (lang: string) =>
  message(lang, "langFirstAirYear");

/** @deprecated Prefer message(locale, key). */
export const langStreamingProvider = (lang: string) =>
  message(lang, "langStreamingProvider");

/** @deprecated Prefer message(locale, key). */
export const langAllProviders = (lang: string) =>
  message(lang, "langAllProviders");

/** @deprecated Prefer message(locale, key). */
export const langAllCertifications = (lang: string) =>
  message(lang, "langAllCertifications");

/** @deprecated Prefer message(locale, key). */
export const langFeaturedSpotlight = (lang: string) =>
  message(lang, "langFeaturedSpotlight");

/** @deprecated Prefer message(locale, key). */
export const langOpenDetails = (lang: string) =>
  message(lang, "langOpenDetails");

/** @deprecated Prefer message(locale, key). */
export const langContinueBrowsing = (lang: string) =>
  message(lang, "langContinueBrowsing");

/** @deprecated Prefer message(locale, key). */
export const langJumpBackIn = (lang: string) => message(lang, "langJumpBackIn");

/** @deprecated Prefer message(locale, key). */
export const langResume = (lang: string) => message(lang, "langResume");

/** @deprecated Prefer message(locale, key). */
export const langRecentSearches = (lang: string) =>
  message(lang, "langRecentSearches");

/** @deprecated Prefer message(locale, key). */
export const langSearchAssist = (lang: string) =>
  message(lang, "langSearchAssist");

/** @deprecated Prefer message(locale, key). */
export const langBrowseHome = (lang: string) => message(lang, "langBrowseHome");

/** @deprecated Prefer message(locale, key). */
export const langBrowseMovies = (lang: string) =>
  message(lang, "langBrowseMovies");

/** @deprecated Prefer message(locale, key). */
export const langBrowseTv = (lang: string) => message(lang, "langBrowseTv");

/** @deprecated Prefer message(locale, key). */
export const langQuickActions = (lang: string) =>
  message(lang, "langQuickActions");

/** @deprecated Prefer message(locale, key). */
export const langExternalLinks = (lang: string) =>
  message(lang, "langExternalLinks");

/** @deprecated Prefer message(locale, key). */
export const langAccount = (lang: string) => message(lang, "langAccount");

/** @deprecated Prefer message(locale, key). */
export const langPreferences = (lang: string) =>
  message(lang, "langPreferences");

/** @deprecated Prefer message(locale, key). */
export const langOpenAccountMenu = (lang: string) =>
  message(lang, "langOpenAccountMenu");

/** @deprecated Prefer message(locale, key). */
export const langAccountMenu = (lang: string) =>
  message(lang, "langAccountMenu");

/** @deprecated Prefer message(locale, key). */
export const langPrimaryNavigation = (lang: string) =>
  message(lang, "langPrimaryNavigation");

/** @deprecated Prefer message(locale, key). */
export const langLanguage = (lang: string) => message(lang, "langLanguage");

/** @deprecated Prefer message(locale, key). */
export const langLanguageName = (lang: string) =>
  message(lang, "langLanguageName");

/** @deprecated Prefer message(locale, key). */
export const langHome = (lang: string) => message(lang, "langHome");

/** @deprecated Prefer message(locale, key). */
export const langPageNotFound = (lang: string) =>
  message(lang, "langPageNotFound");

/** @deprecated Prefer message(locale, key). */
export const langPageNotFoundDescription = (lang: string) =>
  message(lang, "langPageNotFoundDescription");

/** @deprecated Prefer message(locale, key). */
export const langSigningIn = (lang: string) => message(lang, "langSigningIn");

export const langSignInWithProvider = (lang: string, providerName: string) => {
  const providerLabel =
    providerName.charAt(0).toUpperCase() + providerName.slice(1);

  switch (normalizeLocale(lang)) {
    case "en-US":
      return `Sign in with ${providerLabel}`;
    case "ru-RU":
      return `Войти через ${providerLabel}`;
    default:
      return `Войти через ${providerLabel}`;
  }
};

/** @deprecated Prefer message(locale, key). */
export const langPersonalWatchlist = (lang: string) =>
  message(lang, "langPersonalWatchlist");

/** @deprecated Prefer message(locale, key). */
export const langPrivateMovieHub = (lang: string) =>
  message(lang, "langPrivateMovieHub");

/** @deprecated Prefer message(locale, key). */
export const langTrackMoviesAndTvShowsPrefix = (lang: string) =>
  message(lang, "langTrackMoviesAndTvShowsPrefix");

/** @deprecated Prefer message(locale, key). */
export const langTrackMoviesAndTvShowsAccent = (lang: string) =>
  message(lang, "langTrackMoviesAndTvShowsAccent");

/** @deprecated Prefer message(locale, key). */
export const langSimplePlaceToDiscoverTitles = (lang: string) =>
  message(lang, "langSimplePlaceToDiscoverTitles");

/** @deprecated Prefer message(locale, key). */
export const langWhyPeopleUseIt = (lang: string) =>
  message(lang, "langWhyPeopleUseIt");

/** @deprecated Prefer message(locale, key). */
export const langFastSearch = (lang: string) => message(lang, "langFastSearch");

/** @deprecated Prefer message(locale, key). */
export const langFastSearchDescription = (lang: string) =>
  message(lang, "langFastSearchDescription");

/** @deprecated Prefer message(locale, key). */
export const langClearDetails = (lang: string) =>
  message(lang, "langClearDetails");

/** @deprecated Prefer message(locale, key). */
export const langClearDetailsDescription = (lang: string) =>
  message(lang, "langClearDetailsDescription");

/** @deprecated Prefer message(locale, key). */
export const langOneWatchlist = (lang: string) =>
  message(lang, "langOneWatchlist");

/** @deprecated Prefer message(locale, key). */
export const langOneWatchlistDescription = (lang: string) =>
  message(lang, "langOneWatchlistDescription");

/** @deprecated Prefer message(locale, key). */
export const langNew = (lang: string) => message(lang, "langNew");

/** @deprecated Prefer message(locale, key). */
export const langDiscovery = (lang: string) => message(lang, "langDiscovery");

/** @deprecated Prefer message(locale, key). */
export const langSearchMoviesSeriesPeople = (lang: string) =>
  message(lang, "langSearchMoviesSeriesPeople");

/** @deprecated Prefer message(locale, key). */
export const langSearchTitlesCastCrew = (lang: string) =>
  message(lang, "langSearchTitlesCastCrew");

export const langSearchStartsAfterCharacters = (
  lang: string,
  minimumCharacters: number,
) => {
  switch (normalizeLocale(lang)) {
    case "en-US":
      return `Use at least ${minimumCharacters} characters.`;
    case "ru-RU":
      return `Поиск доступен после ${minimumCharacters} символов и сохраняет текущий язык в URL.`;
    default:
      return `Поиск доступен после ${minimumCharacters} символов и сохраняет текущий язык в URL.`;
  }
};

/** @deprecated Prefer message(locale, key). */
export const langSearchTips = (lang: string) => message(lang, "langSearchTips");

export const langSubmitAtLeastCharactersToLoadResults = (
  lang: string,
  minimumCharacters: number,
) => {
  switch (normalizeLocale(lang)) {
    case "en-US":
      return `Submit at least ${minimumCharacters} characters to load results`;
    case "ru-RU":
      return `Введите не менее ${minimumCharacters} символов, чтобы загрузить результаты`;
    default:
      return `Введите не менее ${minimumCharacters} символов, чтобы загрузить результаты`;
  }
};

/** @deprecated Prefer message(locale, key). */
export const langSearchesMoviesTvAndPeople = (lang: string) =>
  message(lang, "langSearchesMoviesTvAndPeople");

/** @deprecated Prefer message(locale, key). */
export const langResultsUpdateWhenYouSubmit = (lang: string) =>
  message(lang, "langResultsUpdateWhenYouSubmit");

/** @deprecated Prefer message(locale, key). */
export const langSearchForATitleOnceAndItWillShowUpHere = (lang: string) =>
  message(lang, "langSearchForATitleOnceAndItWillShowUpHere");

/** @deprecated Prefer message(locale, key). */
export const langHomeFeedUnavailable = (lang: string) =>
  message(lang, "langHomeFeedUnavailable");

/** @deprecated Prefer message(locale, key). */
export const langPleaseRefreshOrTryAgain = (lang: string) =>
  message(lang, "langPleaseRefreshOrTryAgain");

/** @deprecated Prefer message(locale, key). */
export const langLoadingSearchResults = (lang: string) =>
  message(lang, "langLoadingSearchResults");

/** @deprecated Prefer message(locale, key). */
export const langFetchingMatchingTitlesAndPeople = (lang: string) =>
  message(lang, "langFetchingMatchingTitlesAndPeople");

/** @deprecated Prefer message(locale, key). */
export const langSearchUnavailableRightNow = (lang: string) =>
  message(lang, "langSearchUnavailableRightNow");

/** @deprecated Prefer message(locale, key). */
export const langStartWithATitleActorOrDirector = (lang: string) =>
  message(lang, "langStartWithATitleActorOrDirector");

export const langSearchBecomesAvailableAfterCharacters = (
  lang: string,
  minimumCharacters: number,
) => {
  switch (normalizeLocale(lang)) {
    case "en-US":
      return `Enter at least ${minimumCharacters} characters.`;
    case "ru-RU":
      return `Поиск становится доступен после ${minimumCharacters} и более символов.`;
    default:
      return `Поиск становится доступен после ${minimumCharacters} и более символов.`;
  }
};

export const langTryABroaderTitleAPersonNameOrDifferentSpelling = (
  lang: string,
) => {
  switch (normalizeLocale(lang)) {
    case "en-US":
      return "Try a broader title, name, or spelling.";
    case "ru-RU":
      return "Попробуйте более общее название, имя человека или другое написание.";
    default:
      return "Попробуйте более общее название, имя человека или другое написание.";
  }
};

export const langRecentSearchesCount = (lang: string, count: number) =>
  formatCountLabel(
    lang,
    count,
    "recent search",
    "recent searches",
    "недавний поиск",
    "недавних поиска",
    "недавних поисков",
  );

/** @deprecated Prefer message(locale, key). */
export const langNoRecentSearches = (lang: string) =>
  message(lang, "langNoRecentSearches");

export const langSearchTooShort = (
  lang: string,
  remainingCharacters: number,
  minimumCharacters: number,
) => {
  const remainingWord = formatCountWord(
    lang,
    remainingCharacters,
    "character",
    "characters",
    "символ",
    "символа",
    "символов",
  );

  switch (normalizeLocale(lang)) {
    case "en-US":
      return `Search starts after ${minimumCharacters} characters. Add ${remainingCharacters} more ${remainingWord} and submit again.`;
    case "ru-RU":
      return `Поиск доступен после ${minimumCharacters} символов. Добавьте еще ${remainingCharacters} ${remainingWord} и отправьте снова.`;
    default:
      return `Поиск доступен после ${minimumCharacters} символов. Добавьте еще ${remainingCharacters} ${remainingWord} и отправьте снова.`;
  }
};

export const langSearchMatchesCount = (lang: string, count: number) =>
  formatCountLabel(
    lang,
    count,
    "match",
    "matches",
    "совпадение",
    "совпадения",
    "совпадений",
  );

/** @deprecated Prefer message(locale, key). */
export const langHomeDashboardTitle = (lang: string) =>
  message(lang, "langHomeDashboardTitle");

/** @deprecated Prefer message(locale, key). */
export const langHomeDashboardDescription = (lang: string) =>
  message(lang, "langHomeDashboardDescription");

/** @deprecated Prefer message(locale, key). */
export const langFeaturedSpotlightDescription = (lang: string) =>
  message(lang, "langFeaturedSpotlightDescription");

/** @deprecated Prefer message(locale, key). */
export const langPrivateCatalogAccessForSignedInUsers = (lang: string) =>
  message(lang, "langPrivateCatalogAccessForSignedInUsers");

/** @deprecated Prefer message(locale, key). */
export const langGoogleLogo = (lang: string) => message(lang, "langGoogleLogo");

/** @deprecated Prefer message(locale, key). */
export const langAvatar = (lang: string) => message(lang, "langAvatar");

export const langLatestItemsCount = (lang: string, count: number) =>
  formatCountLabel(
    lang,
    count,
    "latest title",
    "latest titles",
    "последний релиз",
    "последних релиза",
    "последних релизов",
  );

export const langTrendingMoviesCount = (lang: string, count: number) =>
  formatCountLabel(
    lang,
    count,
    "trending movie",
    "trending movies",
    "популярный фильм",
    "популярных фильма",
    "популярных фильмов",
  );

export const langTrendingSeriesCount = (lang: string, count: number) =>
  formatCountLabel(
    lang,
    count,
    "trending series",
    "trending series",
    "популярный сериал",
    "популярных сериала",
    "популярных сериалов",
  );

export const langMovieDiscoverSortLabel = (lang: string, sortBy: string) => {
  switch (sortBy) {
    case "vote_average.desc":
      return langText(lang, "Highest Rated", "Сначала высокий рейтинг");
    case "primary_release_date.desc":
      return langText(lang, "Newest Releases", "Сначала новые релизы");
    case "primary_release_date.asc":
      return langText(lang, "Oldest Releases", "Сначала старые релизы");
    case "popularity.desc":
    default:
      return langText(lang, "Popularity", "Популярность");
  }
};

export const langTvDiscoverSortLabel = (lang: string, sortBy: string) => {
  switch (sortBy) {
    case "vote_average.desc":
      return langText(lang, "Highest Rated", "Сначала высокий рейтинг");
    case "first_air_date.desc":
      return langText(lang, "Newest Premieres", "Сначала новые премьеры");
    case "first_air_date.asc":
      return langText(lang, "Oldest Premieres", "Сначала старые премьеры");
    case "popularity.desc":
    default:
      return langText(lang, "Popularity", "Популярность");
  }
};
