import { component$ } from "@builder.io/qwik";
import {
  SiAmazonprime,
  SiAppletv,
  SiCrunchyroll,
  SiFandango,
  SiGoogleplay,
  SiHbo,
  SiHulu,
  SiKinopoisk,
  SiMubi,
  SiNetflix,
  SiPlex,
  SiPrimevideo,
  SiRakuten,
  SiRoku,
  SiShowtime,
  SiSky,
  SiStarz,
  SiTubi,
  SiYoutube,
} from "@qwikest/icons/simpleicons";
import type {
  LocalizedCertification,
  RegionalWatchProviders,
  WatchProvider,
} from "~/services/models";
import {
  langAvailability,
  langCertification,
  langFree,
  langRegion,
  langStream,
  langText,
  langWatchWithAds,
} from "~/utils/languages";

type MediaAvailabilityProps = {
  certification: LocalizedCertification | null;
  lang: string;
  watchProviders: RegionalWatchProviders | null;
};

type ProviderGroup = {
  label: string;
  providers: WatchProvider[];
};

// Map TMDB provider_id to icon key
const PROVIDER_ICON_BY_ID: Record<number, string> = {
  2: "appletv",
  3: "googleplay",
  8: "netflix",
  9: "amazonprime",
  10: "amazonprime",
  15: "hulu",
  43: "starz",
  37: "showtime",
  73: "tubi",
  119: "amazonprime",
  188: "youtube",
  192: "youtube",
  337: "max",
  350: "appletv",
  384: "max",
  531: "primevideo",
  1899: "max",
  283: "crunchyroll",
  11: "mubi",
  300: "plex",
  546: "roku",
  422: "fandango",
  389: "fandango",
  117: "rakuten",
  167: "hbo",
  30: "sky",
  29: "sky",
  68: "sky",
  118: "kinopoisk",
};

// Fallback: match provider name to icon key
const PROVIDER_ICON_BY_NAME: [RegExp, string][] = [
  [/netflix/i, "netflix"],
  [/prime video/i, "primevideo"],
  [/amazon/i, "amazonprime"],
  [/apple\s*tv/i, "appletv"],
  [/google play/i, "googleplay"],
  [/hulu/i, "hulu"],
  [/\bmax\b/i, "max"],
  [/hbo/i, "hbo"],
  [/youtube/i, "youtube"],
  [/crunchyroll/i, "crunchyroll"],
  [/mubi/i, "mubi"],
  [/plex/i, "plex"],
  [/tubi/i, "tubi"],
  [/roku/i, "roku"],
  [/fandango/i, "fandango"],
  [/starz/i, "starz"],
  [/showtime/i, "showtime"],
  [/rakuten/i, "rakuten"],
  [/sky/i, "sky"],
  [/kinopoisk/i, "kinopoisk"],
  [/justwatch/i, "justwatch"],
];

const getProviderIconKey = (provider: WatchProvider): string | null => {
  const byId = PROVIDER_ICON_BY_ID[provider.provider_id];
  if (byId) return byId;
  const name = provider.provider_name ?? "";
  for (const [pattern, key] of PROVIDER_ICON_BY_NAME) {
    if (pattern.test(name)) return key;
  }
  return null;
};

const ProviderIcon = component$<{ iconKey: string }>(({ iconKey }) => {
  switch (iconKey) {
    case "netflix":
      return <SiNetflix />;
    case "amazonprime":
      return <SiAmazonprime />;
    case "primevideo":
      return <SiPrimevideo />;
    case "appletv":
      return <SiAppletv />;
    case "googleplay":
      return <SiGoogleplay />;
    case "hulu":
      return <SiHulu />;
    case "max":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.784 8.716c-.655 0-1.32.29-2.173.946v-.78H0v6.236h1.715V11.24c.749-.592 1.091-.78 1.372-.78c.333 0 .551.209.551.729v3.928h1.715V11.23c.748-.582 1.081-.769 1.372-.769c.333 0 .55.208.55.728v3.928H8.99v-4.53c0-1.403-.8-1.871-1.57-1.871c-.654 0-1.32.27-2.192.936c-.28-.697-.894-.936-1.444-.936m8.689 0c-1.705 0-3.118 1.466-3.118 3.284c0 1.82 1.413 3.285 3.118 3.285c.842 0 1.57-.312 2.131-.988v.82h1.632V8.883h-1.632v.822c-.561-.676-1.29-.988-2.131-.988zm4.064.166c.707 1.102 1.507 2.09 2.443 3.077a26.6 26.6 0 0 0-2.443 3.16h2.069a13.6 13.6 0 0 1 1.673-2.183a14 14 0 0 1 1.632 2.182H24a25 25 0 0 0-2.432-3.16A24 24 0 0 0 24 8.883h-2.047a14.7 14.7 0 0 1-1.674 2.11a13.4 13.4 0 0 1-1.674-2.11zm-3.804 1.279c1.018 0 1.84.82 1.84 1.84a1.837 1.837 0 0 1-1.84 1.839c-1.019 0-1.84-.82-1.84-1.84c0-1.018.821-1.84 1.84-1.84zm0 .415c-.78 0-1.414.633-1.414 1.423s.634 1.424 1.413 1.424c.78 0 1.414-.634 1.414-1.424s-.634-1.424-1.414-1.424z" />
        </svg>
      );
    case "hbo":
      return <SiHbo />;
    case "youtube":
      return <SiYoutube />;
    case "crunchyroll":
      return <SiCrunchyroll />;
    case "mubi":
      return <SiMubi />;
    case "plex":
      return <SiPlex />;
    case "tubi":
      return <SiTubi />;
    case "roku":
      return <SiRoku />;
    case "fandango":
      return <SiFandango />;
    case "starz":
      return <SiStarz />;
    case "showtime":
      return <SiShowtime />;
    case "rakuten":
      return <SiRakuten />;
    case "sky":
      return <SiSky />;
    case "kinopoisk":
      return <SiKinopoisk />;
    case "justwatch":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M11.727 11.7L8.1 9.85s-.646-.344-.617.38s0 3.591 0 3.591s-.1.767.612.427s3.094-1.571 3.627-1.841c.715-.367.005-.707.005-.707m-.006 5.023l-3.628-1.854s-.647-.345-.618.38s0 3.591 0 3.591s-.1.768.613.427s3.093-1.571 3.626-1.841c.717-.367.007-.703.007-.703m4.953-2.464l-3.628-1.854s-.647-.344-.617.38s-.005 3.591-.005 3.591s-.1.768.612.427s3.094-1.57 3.626-1.841c.722-.362.012-.703.012-.703m4.205-2.918L17.844 9.8c-.506-.257-.457.333-.457.333v3.824s-.054.564.468.3l3.025-1.526c1.398-.702-.001-1.39-.001-1.39m-4.203-2.229l-3.629-1.855s-.647-.343-.617.38s0 3.592 0 3.592s-.1.767.612.427s3.094-1.571 3.626-1.841c.717-.367.008-.703.008-.703M7.012 4.257s-1.494-.74-2.945-1.479s-1.539.693-1.539.693v3.128c0 .369.373.217.373.217s3.7-1.886 4.113-2.1s-.002-.459-.002-.459m1.071 4.924c.715-.34 3.094-1.57 3.626-1.841c.722-.366.013-.7.013-.7L8.093 4.783s-.646-.344-.618.38s0 3.591 0 3.591s-.107.768.608.427m-4.961 2.573c.716-.341 3.094-1.571 3.626-1.841c.723-.367.013-.7.013-.7L3.133 7.355s-.647-.343-.618.38s-.005 3.592-.005 3.592s-.103.767.612.427m-.005 4.954c.716-.34 3.094-1.57 3.627-1.841c.722-.366.012-.7.012-.7L3.128 12.31s-.647-.343-.618.38s0 3.591 0 3.591v.101c-.01.196.058.588.607.326M7 19.334c-.418-.216-4.115-2.1-4.115-2.1s-.374-.151-.373.218l.006 3.128s.09 1.434 1.54.692S7 19.791 7 19.791s.415-.24 0-.457" />
        </svg>
      );
    default:
      return null;
  }
});

const deduplicateProviders = (providers: WatchProvider[]): WatchProvider[] => {
  const seen = new Set<number>();
  return providers.filter((p) => {
    if (seen.has(p.provider_id)) return false;
    seen.add(p.provider_id);
    return true;
  });
};

export const MediaAvailability = component$<MediaAvailabilityProps>(
  ({ certification, lang, watchProviders }) => {
    const rentBuyProviders = watchProviders
      ? deduplicateProviders([...watchProviders.rent, ...watchProviders.buy])
      : [];

    const providerGroups: ProviderGroup[] = watchProviders
      ? [
          { label: langStream(lang), providers: watchProviders.flatrate },
          { label: langFree(lang), providers: watchProviders.free },
          { label: langWatchWithAds(lang), providers: watchProviders.ads },
          {
            label: langText(lang, "Rent / Buy", "Аренда / Покупка"),
            providers: rentBuyProviders,
          },
        ].filter((group) => group.providers.length > 0)
      : [];

    if (!certification && providerGroups.length === 0) {
      return null;
    }

    return (
      <section class="card border-base-200 bg-base-100/95 border shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-base-content/80 text-lg">
            {langAvailability(lang)}
          </h3>

          <section class="my-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-sm">
            {certification && (
              <>
                <span class="leading-7 font-bold opacity-70">
                  {langCertification(lang)}:
                </span>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="badge badge-outline badge-sm">
                    {certification.rating}
                  </span>
                  <span class="opacity-70">
                    {langRegion(lang)} {certification.region}
                  </span>
                </div>
              </>
            )}

            {providerGroups.map((group) => (
              <>
                <span
                  key={`${group.label}-label`}
                  class="leading-7 font-bold opacity-70"
                >
                  {group.label}:
                </span>
                <div
                  key={group.label}
                  class="flex flex-wrap items-center gap-2"
                >
                  {group.providers.map((provider) => {
                    const iconKey = getProviderIconKey(provider);
                    return iconKey ? (
                      <div
                        key={provider.provider_id}
                        class="tooltip text-base-content/70 text-3xl"
                        data-tip={provider.provider_name}
                      >
                        <ProviderIcon iconKey={iconKey} />
                      </div>
                    ) : (
                      <span
                        key={provider.provider_id}
                        class="badge badge-outline badge-sm"
                      >
                        {provider.provider_name}
                      </span>
                    );
                  })}
                </div>
              </>
            ))}
          </section>
        </div>
      </section>
    );
  },
);
