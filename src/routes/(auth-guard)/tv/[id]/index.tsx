import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { TvDetails } from "~/components/media-details/tv-details";
import { getOptionalImdbRating } from "~/services/cloud-func-api";
import type { ImdbRating, TvFull, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getMediaRecom } from "~/services/tmdb";

type TvDetailData =
  | {
      status: "ready";
      lang: string;
      tv: TvFull;
      recTv: TvShort[];
      imdb: ImdbRating | null;
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

  try {
    const tv = (await getMediaDetails({
      id,
      language: lang,
      type: MediaType.Tv,
    })) as TvFull;

    const [recTv, imdb] = await Promise.all([
      getMediaRecom({
        id,
        language: lang,
        type: MediaType.Tv,
        query: "recommendations",
      }) as Promise<TvShort[]>,
      getOptionalImdbRating(tv.external_ids.imdb_id),
    ]);

    return {
      status: "ready",
      lang,
      tv,
      recTv,
      imdb,
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
        title="TV details are unavailable"
        description="Please refresh the page or return to the previous screen."
      />
    );
  }

  return (
    <DetailPageShell backdropPath={value.tv.backdrop_path}>
      <TvDetails
        tv={value.tv}
        recTv={value.recTv}
        imdb={value.imdb}
        lang={value.lang}
      />
    </DetailPageShell>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Tv Show Details",
    },
  ],
};
