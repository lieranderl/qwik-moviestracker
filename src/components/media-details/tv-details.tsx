import { component$, useVisibleTask$ } from "@builder.io/qwik";

import { LuDisc3, LuLayers3 } from "@qwikest/icons/lucide";
import { DetailPageContainer } from "~/components/detail-page-layout";
import {
  MediaType,
  type ImdbRating,
  type LocalizedCertification,
  type RegionalWatchProviders,
  type TvFull,
  type TvShort,
} from "~/services/models";
import { formatYear } from "~/utils/format";
import {
  langActors,
  langCreatedby,
  langExternalLinks,
  langOverview,
  langQuickActions,
  langRecommendedTvShows,
  langCountLabel,
  langText,
  langSwipeToBrowse,
} from "~/utils/languages";
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
  imdb: ImdbRating | null;
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
  lang: string;
}

export const TvDetails = component$(
  ({
    tv,
    recTv,
    imdb,
    certification,
    watchProviders,
    lang,
  }: TvDetailsProps) => {
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      writeLastViewed({
        href: paths.media(MediaType.Tv, tv.id, lang),
        title: tv.name ?? langText(lang, "TV details", "Детали сериала"),
        kind: "tv",
        meta: tv.first_air_date
          ? `${formatYear(tv.first_air_date)} • ${langText(lang, "TV", "Сериал")}`
          : langText(lang, "TV", "Сериал"),
        imagePath: tv.poster_path ?? tv.backdrop_path,
      });
    });

    return (
      <DetailPageContainer>
        <section class="card border-base-200 bg-base-100/95 border shadow-sm">
          <div class="card-body gap-6">
            <div class="space-y-2">
              <MediaTitle
                name={tv.name ?? ""}
                original_name={tv.original_name}
              />
              {tv.tagline && (
                <p class="text-lg italic opacity-80 md:text-xl">
                  "{tv.tagline}"
                </p>
              )}
            </div>

            <div class="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span class="badge badge-ghost">
                {formatYear(tv.first_air_date) || langText(lang, "N/A", "Нет данных")}
              </span>
              {certification && (
                <span class="badge badge-ghost">
                  {certification.rating} • {certification.region}
                </span>
              )}
              <span class="badge badge-ghost gap-1">
                <LuLayers3 class="text-sm" />
                {langCountLabel(
                  lang,
                  tv.number_of_seasons ?? 0,
                  "Season",
                  "Seasons",
                  "сезон",
                  "сезона",
                  "сезонов",
                )}
              </span>
              <span class="badge badge-ghost gap-1">
                <LuDisc3 class="text-sm" />
                {langCountLabel(
                  lang,
                  tv.number_of_episodes ?? 0,
                  "Episode",
                  "Episodes",
                  "серия",
                  "серии",
                  "серий",
                )}
              </span>
              {tv.genres?.map((g) => (
                <span key={g.id} class="badge badge-ghost">
                  {g.name}
                </span>
              ))}
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4">
              <MediaRating
                vote_average={tv.vote_average}
                vote_count={tv.vote_count}
                imdb={imdb}
              />
            </div>
          </div>
        </section>

        <section class="section-reveal card border-base-200 bg-base-100/95 relative z-20 mt-6 border shadow-sm">
          <div class="card-body gap-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.14em] uppercase">
                  {langQuickActions(lang)}
                </p>
                <h3 class="text-xl font-semibold">{langExternalLinks(lang)}</h3>
              </div>
              <div class="flex flex-wrap gap-3">
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
            </div>
            <ExternalIds external_ids={tv.external_ids} lang={lang} type={"tv"} />
          </div>
        </section>

        <section class="section-reveal card border-base-200 bg-base-100/95 relative z-0 mt-6 border shadow-sm">
            <div class="card-body">
              <h3 class="card-title text-xl">{langOverview(lang)}</h3>
              <p class="leading-relaxed opacity-90">
                {tv.overview || langText(lang, "No overview available.", "Описание отсутствует.")}
              </p>
            </div>
          </section>

        <div class="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
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

          <div class="space-y-6">
            <MediaAvailability
              certification={certification}
              watchProviders={watchProviders}
              lang={lang}
            />

            <section class="section-reveal card border-base-200 bg-base-100/95 border shadow-sm">
              <div class="card-body">
                <h3 class="card-title text-base-content/80 text-lg">
                  {langText(lang, "Series Stats", "Статистика сериала")}
                </h3>
                <div class="stats stats-vertical bg-transparent">
                  <div class="stat px-0 py-3">
                    <div class="stat-title">{langText(lang, "Seasons", "Сезоны")}</div>
                    <div class="stat-value text-lg">{tv.number_of_seasons}</div>
                  </div>
                  <div class="stat px-0 py-3">
                    <div class="stat-title">{langText(lang, "Episodes", "Серии")}</div>
                    <div class="stat-value text-lg">
                      {tv.number_of_episodes}
                    </div>
                  </div>
                  <div class="stat px-0 py-3">
                    <div class="stat-title">{langText(lang, "Status", "Статус")}</div>
                    <div class="stat-value text-lg">
                      {tv.status || langText(lang, "Unknown", "Неизвестно")}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="mt-10 space-y-10">
          <TvSeasons lang={lang} seasons={tv.seasons} />

          {tv.created_by.length > 0 && (
            <MediaCarousel
              hintLabel={langSwipeToBrowse(lang)}
              title={langCreatedby(lang)}
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
            hintLabel={langSwipeToBrowse(lang)}
            title={langActors(lang)}
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
              hintLabel={langSwipeToBrowse(lang)}
              title={langRecommendedTvShows(lang)}
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
