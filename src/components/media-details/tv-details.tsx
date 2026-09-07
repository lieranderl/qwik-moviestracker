import { message } from "~/utils/i18n";
import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";

import { LuDisc3, LuLayers3 } from "@qwikest/icons/lucide";
import { DetailPageContainer } from "~/components/detail-page-layout";
import {
  MediaType,
  type LocalizedCertification,
  type RegionalWatchProviders,
  type TvFull,
  type TvShort,
} from "~/services/models";
import { formatYear } from "~/utils/format";
import { langEpisodesCount, langSeasonsCount } from "~/utils/languages";
import { paths } from "~/utils/paths";
import { writeLastViewed } from "~/utils/recent-activity";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { TorrentsModal } from "../torrents-list-modal";
import { TrailersModal } from "../trailers-list-modal";
import { MediaInfo } from "./media-info";
import { MediaAvailability } from "./media-availability";
import { MediaRating } from "./media-rating";
import { MediaTitle } from "./media-title";
import { TvEpisodeStatus } from "./tv-episode-status";
import { TvSeasons } from "./tv-seasons";

interface TvDetailsProps {
  tv: TvFull;
  recTv: TvShort[];
  imdbId?: string | null;
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
  lang: string;
}

const sectionCardClass = "card border-base-200 bg-base-100/95 border shadow-sm";
const sectionBodyClass = "card-body gap-4 p-4 md:p-6";

export const TvDetails = component$(
  ({
    tv,
    recTv,
    imdbId,
    certification,
    watchProviders,
    lang,
  }: TvDetailsProps) => {
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      writeLastViewed({
        href: paths.media(MediaType.Tv, tv.id, lang),
        title: tv.name ?? message(lang, "ui.tvDetails"),
        kind: "tv",
        meta: tv.first_air_date
          ? `${formatYear(tv.first_air_date)} • ${message(lang, "ui.tv")}`
          : message(lang, "ui.tv"),
        imagePath: tv.poster_path ?? tv.backdrop_path,
      });
    });

    const hasActions = (tv.videos && tv.videos.results.length > 0) || true;

    return (
      <DetailPageContainer>
        {/* ── HERO: Poster + Title + Metadata + Rating + Actions ── */}
        <section class={`${sectionCardClass} sm:card-side`}>
          <figure class="mx-auto w-48 shrink-0 p-4 pb-0 sm:mx-0 sm:w-56 sm:p-6 sm:pr-0 lg:w-64">
            {tv.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${tv.poster_path}`}
                width={342}
                height={513}
                alt={tv.name ?? message(lang, "ui.tvPoster")}
                class="rounded-box h-auto w-full shadow-lg"
              />
            ) : (
              <div class="bg-base-200 rounded-box flex aspect-2/3 w-full items-center justify-center">
                <span
                  class="text-base-content/20 text-5xl select-none"
                  aria-hidden="true"
                >
                  📺
                </span>
              </div>
            )}
          </figure>
          <div class={`${sectionBodyClass} min-w-0 flex-1`}>
            <MediaTitle name={tv.name ?? ""} original_name={tv.original_name} />

            {tv.tagline && (
              <p class="text-base-content/70 -mt-1 italic md:text-lg">
                {lang === "en-US" ? `"${tv.tagline}"` : tv.tagline}
              </p>
            )}

            {/* Metadata badges */}
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="badge badge-ghost badge-sm">
                {formatYear(tv.first_air_date) || message(lang, "ui.nA")}
              </span>
              {certification && (
                <span class="badge badge-ghost badge-sm">
                  {certification.rating}
                </span>
              )}
              <span class="badge badge-ghost badge-sm gap-1">
                <LuLayers3 class="text-xs" />
                {langSeasonsCount(lang, tv.number_of_seasons ?? 0)}
              </span>
              <span class="badge badge-ghost badge-sm gap-1">
                <LuDisc3 class="text-xs" />
                {langEpisodesCount(lang, tv.number_of_episodes ?? 0)}
              </span>
              {tv.genres?.map((g) => (
                <span key={g.id} class="badge badge-ghost badge-sm">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Rating */}
            <MediaRating
              vote_average={tv.vote_average}
              vote_count={tv.vote_count}
              imdbId={imdbId}
              lang={lang}
            />

            {/* Primary actions */}
            {hasActions && (
              <div class="card-actions mt-1">
                {tv.videos && tv.videos.results.length > 0 && (
                  <TrailersModal videos={tv.videos.results} />
                )}
                <TorrentsModal
                  title={tv.name ? tv.name : ""}
                  year={formatYear(tv.first_air_date)}
                  isMovie={false}
                  seasons={tv.seasons}
                  media={tv}
                  lang={lang}
                />
              </div>
            )}
          </div>
        </section>

        <div class="divider" />

        {/* ── OVERVIEW ── */}
        <section class={sectionCardClass}>
          <div class={sectionBodyClass}>
            <h2 class="card-title text-xl">{message(lang, "langOverview")}</h2>
            {tv.overview ? (
              <p class="leading-relaxed opacity-90">{tv.overview}</p>
            ) : (
              <p class="text-base-content/50 italic">
                {message(lang, "ui.noOverviewAvailable")}
              </p>
            )}
          </div>
        </section>

        <div class="divider" />

        {/* ── DETAILS: Production + Availability side-by-side on desktop ── */}
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-6">
            <MediaInfo
              release_date={tv.first_air_date}
              production_countries={tv.production_countries}
              production_companies={tv.production_companies}
              original_language={tv.original_language}
              lang={lang}
              networks={tv.networks}
            />
            <TvEpisodeStatus
              lang={lang}
              last_episode_to_air={tv.last_episode_to_air}
              next_episode_to_air={tv.next_episode_to_air}
              in_production={tv.in_production}
            />
          </div>
          <MediaAvailability
            certification={certification}
            watchProviders={watchProviders}
            lang={lang}
          />
        </div>

        {/* ── SERIES STATS ── */}
        <section class={sectionCardClass}>
          <div class={sectionBodyClass}>
            <h3 class="card-title text-base-content/80 text-lg">
              {message(lang, "ui.seriesStats")}
            </h3>
            <div class="stats stats-vertical bg-transparent">
              <div class="stat px-0 py-3">
                <div class="stat-title">{message(lang, "ui.seasons")}</div>
                <div class="stat-value text-lg">{tv.number_of_seasons}</div>
              </div>
              <div class="stat px-0 py-3">
                <div class="stat-title">{message(lang, "ui.episodes")}</div>
                <div class="stat-value text-lg">{tv.number_of_episodes}</div>
              </div>
              <div class="stat px-0 py-3">
                <div class="stat-title">{message(lang, "ui.status")}</div>
                <div class="stat-value text-lg">
                  {tv.status || message(lang, "ui.unknown")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="divider" />

        {/* ── EXTERNAL LINKS ── */}
        <ExternalIds external_ids={tv.external_ids} lang={lang} type={"tv"} />

        <div class="divider" />

        {/* ── SEASONS / CREATED BY / CAST / RECOMMENDED ── */}
        <div class="space-y-6">
          <TvSeasons lang={lang} seasons={tv.seasons} />

          {tv.created_by.length > 0 && (
            <MediaCarousel
              title={message(lang, "langCreatedby")}
              type={MediaType.Person}
              lang={lang}
            >
              {tv.created_by.slice(0, 10).map((c) => (
                <div key={c.id} class="carousel-item">
                  <a
                    href={paths.media(MediaType.Person, c.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={c.name ?? ""}
                      width={300}
                      year={0}
                      rating={0}
                      picfile={c.profile_path}
                      variant="person"
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}

          <MediaCarousel
            title={message(lang, "langActors")}
            type={MediaType.Person}
            lang={lang}
          >
            {tv.credits?.cast.slice(0, 10).map((c) => (
              <div key={c.id} class="carousel-item">
                <a
                  href={paths.media(MediaType.Person, c.id, lang)}
                  class="media-card-link"
                >
                  <MediaCard
                    title={c.name ?? ""}
                    width={300}
                    year={0}
                    rating={0}
                    picfile={c.profile_path}
                    variant="person"
                    metaLabel={c.character}
                  />
                </a>
              </div>
            ))}
          </MediaCarousel>

          {recTv.length > 0 && (
            <MediaCarousel
              title={message(lang, "langRecommendedTvShows")}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {recTv.map((m) => (
                <div key={m.id} class="carousel-item">
                  <a
                    href={paths.media(MediaType.Tv, m.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={m.name ? m.name : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={formatYear(m.first_air_date)}
                      picfile={m.backdrop_path}
                      tmdbId={m.id}
                      mediaType={MediaType.Tv}
                      language={lang}
                      variant="landscape"
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}
        </div>
      </DetailPageContainer>
    );
  },
);
