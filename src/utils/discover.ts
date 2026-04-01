import type {
  CertificationList,
  CertificationListEntry,
  WatchProviderCatalog,
  WatchProviderCatalogItem,
} from "~/services/models";

const DEFAULT_MIN_VOTES = 100;
const DEFAULT_REGION = "US";
const MAX_PAGE = 500;
const MAX_YEAR = 2100;
const MIN_YEAR = 1888;

export const MOVIE_DISCOVER_SORT_OPTIONS = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Highest Rated", value: "vote_average.desc" },
  { label: "Newest Releases", value: "primary_release_date.desc" },
  { label: "Oldest Releases", value: "primary_release_date.asc" },
] as const;

export const TV_DISCOVER_SORT_OPTIONS = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Highest Rated", value: "vote_average.desc" },
  { label: "Newest Premieres", value: "first_air_date.desc" },
  { label: "Oldest Premieres", value: "first_air_date.asc" },
] as const;

export type MovieDiscoverSortBy =
  (typeof MOVIE_DISCOVER_SORT_OPTIONS)[number]["value"];
export type TvDiscoverSortBy = (typeof TV_DISCOVER_SORT_OPTIONS)[number]["value"];

export type DiscoverProviderOption = {
  label: string;
  value: number;
};

export type DiscoverCertificationOption = {
  label: string;
  meaning?: string;
  value: string;
};

export type MovieDiscoverFilters = {
  certification?: string;
  minVotes: number;
  page: number;
  providerId?: number;
  region: string;
  sortBy: MovieDiscoverSortBy;
  year?: number;
};

export type TvDiscoverFilters = {
  minVotes: number;
  page: number;
  providerId?: number;
  region: string;
  sortBy: TvDiscoverSortBy;
  year?: number;
};

const parseOptionalPositiveInteger = (
  value: string | null,
  {
    max,
    min = 1,
  }: {
    max?: number;
    min?: number;
  } = {},
) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min) {
    return undefined;
  }

  if (max !== undefined && parsed > max) {
    return undefined;
  }

  return parsed;
};

const getProviderPriority = (
  provider: WatchProviderCatalogItem,
  region: string,
) => {
  return (
    provider.display_priorities?.[region] ??
    provider.display_priority ??
    Number.MAX_SAFE_INTEGER
  );
};

const sortCertificationEntries = (
  left: CertificationListEntry,
  right: CertificationListEntry,
) => {
  const orderDelta =
    (left.order ?? Number.MAX_SAFE_INTEGER) -
    (right.order ?? Number.MAX_SAFE_INTEGER);

  if (orderDelta !== 0) {
    return orderDelta;
  }

  return left.certification.localeCompare(right.certification);
};

export const getDiscoverRegions = (
  certifications?: CertificationList | null,
  defaultRegion = DEFAULT_REGION,
) => {
  const regions = Object.keys(certifications?.certifications ?? {}).filter(
    Boolean,
  );

  if (regions.length === 0) {
    return [defaultRegion];
  }

  return [...new Set(regions.map((region) => region.toUpperCase()))].sort(
    (left, right) => {
      if (left === defaultRegion) return -1;
      if (right === defaultRegion) return 1;
      return left.localeCompare(right);
    },
  );
};

export const getCertificationOptions = (
  certifications: CertificationList | null | undefined,
  region: string,
) => {
  const entries =
    certifications?.certifications?.[region] ??
    certifications?.certifications?.[DEFAULT_REGION] ??
    [];

  return [...entries]
    .filter((entry) => entry.certification.trim().length > 0)
    .sort(sortCertificationEntries)
    .map((entry) => ({
      label: entry.certification,
      meaning: entry.meaning,
      value: entry.certification,
    }));
};

export const getProviderOptions = (
  providerCatalog: WatchProviderCatalog | null | undefined,
  region: string,
) => {
  const providers = providerCatalog?.results ?? [];
  const providersForRegion = providers.filter(
    (provider) => provider.display_priorities?.[region] !== undefined,
  );

  const source = providersForRegion.length > 0 ? providersForRegion : providers;

  return [...source]
    .filter((provider) => provider.provider_name)
    .sort(
      (left, right) =>
        getProviderPriority(left, region) - getProviderPriority(right, region) ||
        (left.provider_name ?? "").localeCompare(right.provider_name ?? ""),
    )
    .map((provider) => ({
      label: provider.provider_name ?? `Provider ${provider.provider_id}`,
      value: provider.provider_id,
    }));
};

export const normalizeDiscoverRegion = (
  value: string | null,
  availableRegions: string[],
  fallbackRegion: string,
) => {
  const normalized = value?.trim().toUpperCase();
  if (normalized && availableRegions.includes(normalized)) {
    return normalized;
  }

  return availableRegions[0] ?? fallbackRegion;
};

const normalizeMovieSort = (value: string | null): MovieDiscoverSortBy => {
  const selected = MOVIE_DISCOVER_SORT_OPTIONS.find(
    (option) => option.value === value,
  );
  return selected?.value ?? "popularity.desc";
};

const normalizeTvSort = (value: string | null): TvDiscoverSortBy => {
  const selected = TV_DISCOVER_SORT_OPTIONS.find(
    (option) => option.value === value,
  );
  return selected?.value ?? "popularity.desc";
};

export const createMovieDiscoverFilters = ({
  certifications,
  defaultRegion = DEFAULT_REGION,
  providerCatalog,
  searchParams,
}: {
  certifications?: CertificationList | null;
  defaultRegion?: string;
  providerCatalog?: WatchProviderCatalog | null;
  searchParams: URLSearchParams;
}): MovieDiscoverFilters => {
  const availableRegions = getDiscoverRegions(certifications, defaultRegion);
  const region = normalizeDiscoverRegion(
    searchParams.get("region"),
    availableRegions,
    defaultRegion,
  );
  const certificationOptions = getCertificationOptions(certifications, region);
  const providerOptions = getProviderOptions(providerCatalog, region);
  const providerId = parseOptionalPositiveInteger(searchParams.get("provider"));
  const certification = searchParams.get("certification")?.trim();

  return {
    certification: certificationOptions.some(
      (option) => option.value === certification,
    )
      ? certification
      : undefined,
    minVotes:
      parseOptionalPositiveInteger(searchParams.get("minVotes"), {
        max: 1_000_000,
        min: 0,
      }) ?? DEFAULT_MIN_VOTES,
    page:
      parseOptionalPositiveInteger(searchParams.get("page"), {
        max: MAX_PAGE,
      }) ?? 1,
    providerId: providerOptions.some((option) => option.value === providerId)
      ? providerId
      : undefined,
    region,
    sortBy: normalizeMovieSort(searchParams.get("sortBy")),
    year: parseOptionalPositiveInteger(searchParams.get("year"), {
      max: MAX_YEAR,
      min: MIN_YEAR,
    }),
  };
};

export const createTvDiscoverFilters = ({
  certifications,
  defaultRegion = DEFAULT_REGION,
  providerCatalog,
  searchParams,
}: {
  certifications?: CertificationList | null;
  defaultRegion?: string;
  providerCatalog?: WatchProviderCatalog | null;
  searchParams: URLSearchParams;
}): TvDiscoverFilters => {
  const availableRegions = getDiscoverRegions(certifications, defaultRegion);
  const region = normalizeDiscoverRegion(
    searchParams.get("region"),
    availableRegions,
    defaultRegion,
  );
  const providerOptions = getProviderOptions(providerCatalog, region);
  const providerId = parseOptionalPositiveInteger(searchParams.get("provider"));

  return {
    minVotes:
      parseOptionalPositiveInteger(searchParams.get("minVotes"), {
        max: 1_000_000,
        min: 0,
      }) ?? DEFAULT_MIN_VOTES,
    page:
      parseOptionalPositiveInteger(searchParams.get("page"), {
        max: MAX_PAGE,
      }) ?? 1,
    providerId: providerOptions.some((option) => option.value === providerId)
      ? providerId
      : undefined,
    region,
    sortBy: normalizeTvSort(searchParams.get("sortBy")),
    year: parseOptionalPositiveInteger(searchParams.get("year"), {
      max: MAX_YEAR,
      min: MIN_YEAR,
    }),
  };
};
