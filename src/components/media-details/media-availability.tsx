import { component$ } from "@builder.io/qwik";
import type {
  LocalizedCertification,
  RegionalWatchProviders,
  WatchProvider,
} from "~/services/models";
import {
  langAvailability,
  langCertification,
  langFree,
  langOpenOnTmdb,
  langRegion,
  langRent,
  langStream,
  langSupportedByTmdb,
  langWatchWithAds,
  langBuy,
  langWhereToWatch,
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

export const MediaAvailability = component$<MediaAvailabilityProps>(
  ({ certification, lang, watchProviders }) => {
    const providerGroups: ProviderGroup[] = watchProviders
      ? [
          {
            label: langStream(lang),
            providers: watchProviders.flatrate,
          },
          {
            label: langFree(lang),
            providers: watchProviders.free,
          },
          {
            label: langWatchWithAds(lang),
            providers: watchProviders.ads,
          },
          {
            label: langRent(lang),
            providers: watchProviders.rent,
          },
          {
            label: langBuy(lang),
            providers: watchProviders.buy,
          },
        ].filter((group) => group.providers.length > 0)
      : [];

    if (!certification && !watchProviders) {
      return null;
    }

    return (
      <section class="section-reveal card border-base-200 bg-base-100/95 border shadow-sm">
        <div class="card-body gap-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h3 class="card-title text-base-content/80 text-lg">
                {langAvailability(lang)}
              </h3>
              <p class="text-base-content/60 text-sm">
                {watchProviders
                  ? `${langWhereToWatch(lang)} ${watchProviders.region}`
                  : langSupportedByTmdb(lang)}
              </p>
            </div>
            {watchProviders?.link && (
              <a
                href={watchProviders.link}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline btn-sm"
              >
                {langOpenOnTmdb(lang)}
              </a>
            )}
          </div>

          {certification && (
            <div class="rounded-box border-base-300/70 bg-base-200/60 border p-4">
              <div class="text-base-content/60 text-xs font-semibold tracking-[0.14em] uppercase">
                {langCertification(lang)}
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="badge badge-secondary">
                  {certification.rating}
                </span>
                <span class="badge badge-ghost h-auto max-w-full gap-1 px-3 py-2 text-center leading-tight whitespace-normal">
                  {langRegion(lang)} {certification.region}
                </span>
              </div>
            </div>
          )}

          {providerGroups.length > 0 && (
            <div class="space-y-4">
              {providerGroups.map((group) => (
                <div key={group.label} class="space-y-2">
                  <div class="text-base-content/60 text-xs font-semibold tracking-[0.14em] uppercase">
                    {group.label}
                  </div>
                  <div class="flex flex-wrap gap-2">
                    {group.providers.map((provider) => (
                      <span
                        key={provider.provider_id}
                        class="badge badge-soft badge-sm h-auto max-w-full px-3 py-2 text-center leading-tight whitespace-normal"
                      >
                        {provider.provider_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  },
);
