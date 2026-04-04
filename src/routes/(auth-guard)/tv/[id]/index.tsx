import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { TvDetails } from "~/components/media-details/tv-details";
import {
  createDevTvDetail,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import { getOptionalImdbRating } from "~/services/cloud-func-api";
import type {
  ImdbRating,
  LocalizedCertification,
  RegionalWatchProviders,
  TvFull,
  TvShort,
} from "~/services/models";
import { MediaType } from "~/services/models";
import {
  getMediaRecom,
  getOptionalWatchProviders,
  getRegionFromLanguage,
  getTvDetails,
  resolveRegionalWatchProviders,
  resolveTvCertification,
} from "~/services/tmdb";
import { langText } from "~/utils/languages";

type TvDetailData =
  | {
      status: "ready";
      lang: string;
      tv: TvFull;
      recTv: TvShort[];
      imdb: ImdbRating | null;
      certification: LocalizedCertification | null;
      watchProviders: RegionalWatchProviders | null;
    }
  | {
      status: "error";
      lang: string;
    };

export const useTvDetailLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = Number.parseInt(event.params.id, 10);

  if (Number.isNaN(id)) {
    return {
      status: "error",
      lang,
    } satisfies TvDetailData;
  }

  const devTvDetail = createDevTvDetail({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    id,
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devTvDetail) {
    return {
      status: "ready",
      ...devTvDetail,
    } satisfies TvDetailData;
  }

  try {
    const tv = await getTvDetails({
      id,
      language: lang,
    });
    const region = getRegionFromLanguage(lang);

    const [recTv, imdb, watchProviderResults] = await Promise.all([
      getMediaRecom({
        id,
        language: lang,
        type: MediaType.Tv,
        query: "recommendations",
      }) as Promise<TvShort[]>,
      getOptionalImdbRating(tv.external_ids.imdb_id),
      getOptionalWatchProviders({
        id,
        type: MediaType.Tv,
      }),
    ]);

    return {
      status: "ready",
      lang,
      tv,
      recTv,
      imdb,
      certification: resolveTvCertification(tv.content_ratings, region),
      watchProviders: resolveRegionalWatchProviders(
        watchProviderResults,
        region,
      ),
    } satisfies TvDetailData;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      lang,
    } satisfies TvDetailData;
  }
});

export default component$(() => {
  const value = useTvDetailLoader().value;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={langText(
          value.lang,
          "TV details are unavailable",
          "Детали сериала недоступны",
        )}
        description={langText(
          value.lang,
          "Please refresh the page or return to the previous screen.",
          "Обновите страницу или вернитесь на предыдущий экран.",
        )}
      />
    );
  }

  return (
    <DetailPageShell backdropPath={value.tv.backdrop_path}>
      <TvDetails
        tv={value.tv}
        recTv={value.recTv}
        imdb={value.imdb}
        certification={value.certification}
        watchProviders={value.watchProviders}
        lang={value.lang}
      />
    </DetailPageShell>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "TV details",
      "Детали сериала",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(lang, "TV details", "Детали сериала"),
      },
    ],
  };
};
