import type {
  ContentRatings,
  LocalizedCertification,
  ReleaseDates,
  ReleaseDateEntry,
  WatchProvider,
  RegionalWatchProviders,
  WatchProviderResults,
} from "~/services/models";

const DEFAULT_REGION = "US";

const cleanValue = (value?: null | string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const withFallbackRegion = <T extends { iso_3166_1?: string }>(
  items: T[] | undefined,
  region: string,
) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    items.find((item) => item.iso_3166_1 === region) ??
    items.find((item) => item.iso_3166_1 === DEFAULT_REGION) ??
    items[0] ??
    null
  );
};

const sortProviders = (providers?: WatchProvider[]) => {
  return [...(providers ?? [])].sort((left, right) => {
    const priorityDelta =
      (left.display_priority ?? Number.MAX_SAFE_INTEGER) -
      (right.display_priority ?? Number.MAX_SAFE_INTEGER);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return (left.provider_name ?? "").localeCompare(right.provider_name ?? "");
  });
};

const getReleaseDatePriority = (entry: ReleaseDateEntry) => {
  switch (entry.type) {
    case 3:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 5:
      return 3;
    case 6:
      return 4;
    case 1:
      return 5;
    default:
      return 99;
  }
};

export const getRegionFromLanguage = (language: string) => {
  const [, region] = language.split("-");
  return region?.toUpperCase() ?? DEFAULT_REGION;
};

export const resolveMovieCertification = (
  releaseDates?: ReleaseDates,
  region = DEFAULT_REGION,
): LocalizedCertification | null => {
  const regionReleaseDates = withFallbackRegion(releaseDates?.results, region);
  if (!regionReleaseDates) {
    return null;
  }

  const rating = [...regionReleaseDates.release_dates]
    .sort(
      (left, right) =>
        getReleaseDatePriority(left) - getReleaseDatePriority(right),
    )
    .map((releaseDate) => cleanValue(releaseDate.certification))
    .find(Boolean);

  return rating
    ? {
        rating,
        region: regionReleaseDates.iso_3166_1 ?? DEFAULT_REGION,
      }
    : null;
};

export const resolveTvCertification = (
  contentRatings?: ContentRatings,
  region = DEFAULT_REGION,
): LocalizedCertification | null => {
  const rating = withFallbackRegion(contentRatings?.results, region);
  const certification = cleanValue(rating?.rating);

  return certification
    ? {
        rating: certification,
        region: rating?.iso_3166_1 ?? DEFAULT_REGION,
      }
    : null;
};

export const resolveRegionalWatchProviders = (
  watchProviders?: WatchProviderResults | null,
  region = DEFAULT_REGION,
): RegionalWatchProviders | null => {
  const entries = Object.entries(watchProviders?.results ?? {});
  const [selectedRegion, selectedProviders] =
    entries.find(([entryRegion]) => entryRegion === region) ??
    entries.find(([entryRegion]) => entryRegion === DEFAULT_REGION) ??
    [];

  if (!selectedRegion || !selectedProviders) {
    return null;
  }

  return {
    ads: sortProviders(selectedProviders.ads),
    buy: sortProviders(selectedProviders.buy),
    flatrate: sortProviders(selectedProviders.flatrate),
    free: sortProviders(selectedProviders.free),
    link: selectedProviders.link,
    region: selectedRegion,
    rent: sortProviders(selectedProviders.rent),
  };
};
