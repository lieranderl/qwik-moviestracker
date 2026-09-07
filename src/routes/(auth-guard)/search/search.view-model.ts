import { message } from "~/utils/i18n";
import { MediaType } from "~/services/models";
import { langSearchTooShort } from "~/utils/languages";
import { formatYear } from "~/utils/format";
import { paths } from "~/utils/paths";
import {
  getSearchPhrase,
  MIN_SEARCH_QUERY_LENGTH,
  normalizeSearchQuery,
} from "./search.logic";

export type SearchAssistLink = {
  href: string;
  label: string;
};

export type SearchFormViewModel = {
  query: string;
  searchPhrase: string;
  shortQueryMessage: string | null;
};

export type SearchResultViewModel = {
  href: string;
  id: number;
  picfile: string | null | undefined;
  rating: number;
  title: string;
  variant: "person" | "poster";
  year: number;
};

type SearchResultLike = {
  first_air_date?: string;
  id: number;
  media_type?: MediaType | string;
  name?: string;
  poster_path?: null | string;
  profile_path?: null | string;
  release_date?: string;
  title?: string;
  vote_average?: number;
};

const resolveSearchResultMediaType = (
  mediaType: SearchResultLike["media_type"],
) => {
  switch (mediaType) {
    case MediaType.Tv:
      return MediaType.Tv;
    case MediaType.Person:
      return MediaType.Person;
    case MediaType.Movie:
    default:
      return MediaType.Movie;
  }
};

export const createSearchFormViewModel = (
  query: string,
  lang = "en-US",
): SearchFormViewModel => {
  const normalizedQuery = normalizeSearchQuery(query);
  const searchPhrase = getSearchPhrase(normalizedQuery);

  if (!normalizedQuery || searchPhrase) {
    return {
      query: normalizedQuery,
      searchPhrase,
      shortQueryMessage: null,
    };
  }

  const remainingCharacters = MIN_SEARCH_QUERY_LENGTH - normalizedQuery.length;

  return {
    query: normalizedQuery,
    searchPhrase,
    shortQueryMessage: langSearchTooShort(
      lang,
      remainingCharacters,
      MIN_SEARCH_QUERY_LENGTH,
    ),
  };
};

export const createSearchAssistLinks = (lang: string): SearchAssistLink[] => {
  return [
    {
      href: paths.index(lang),
      label: message(lang, "langBrowseHome"),
    },
    {
      href: paths.movie(lang),
      label: message(lang, "langBrowseMovies"),
    },
    {
      href: paths.movieDiscover(lang),
      label: message(lang, "langDiscoverMovies"),
    },
    {
      href: paths.tv(lang),
      label: message(lang, "langBrowseTv"),
    },
    {
      href: paths.tvDiscover(lang),
      label: message(lang, "langDiscoverTv"),
    },
  ];
};

export const normalizeSearchResults = ({
  language,
  results,
}: {
  language: string;
  results: SearchResultLike[];
}): SearchResultViewModel[] => {
  return results.map((result) => {
    const mediaType = resolveSearchResultMediaType(result.media_type);
    const isPerson = mediaType === MediaType.Person;

    return {
      href: paths.media(mediaType, result.id, language),
      id: result.id,
      picfile: isPerson ? result.profile_path : result.poster_path,
      rating: result.vote_average ?? 0,
      title:
        mediaType === MediaType.Movie
          ? (result.title ?? result.name ?? "")
          : (result.name ?? result.title ?? ""),
      variant: isPerson ? "person" : "poster",
      year:
        mediaType === MediaType.Movie
          ? formatYear(result.release_date)
          : mediaType === MediaType.Tv
            ? formatYear(result.first_air_date)
            : 0,
    };
  });
};
