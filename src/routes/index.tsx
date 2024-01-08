import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import type {
  MediaShort,
  MovieMongo,
  MovieShort,
  TvShort,
} from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withBackdrop } from "~/services/tmdb";
import { formatYear } from "~/utils/fomat";
import {
  langLatestMovies,
  langTrendingMovies,
  langTrengingTVShows,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const needbackdrop = true;
  try {
    const [m, t, tm] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: needbackdrop,
      }),
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: needbackdrop,
      }),
      withBackdrop(
        (await getMoviesMongo({
          entries_on_page: 20,
          language: lang,
          dbName: DbType.LastMovies,
          page: 1,
        })) as MediaShort[],
      ),
    ]);
    const movies = m as MovieShort[];
    const tv = t as TvShort[];
    const torMovies = tm as MovieMongo[];
    return {
      movies,
      tv,
      torMovies,
      lang,
    };
  } catch {
    throw event.redirect(302, paths.notFound(lang));
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="container mx-auto px-4 pt-[64px]">
        <MediaCarousel
          title={langLatestMovies(resource.value.lang)}
          type={MediaType.Movie}
          category="updated"
          lang={resource.value.lang}
        >
          {resource.value.torMovies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={(m.release_date && formatYear(m.release_date)) || 0}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title={langTrendingMovies(resource.value.lang)}
          type={MediaType.Movie}
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.movies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={(m.release_date && formatYear(m.release_date)) || 0}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title={langTrengingTVShows(resource.value.lang)}
          type={MediaType.Tv}
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.tv.map((m) => (
            <>
              <a href={paths.media(MediaType.Tv, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.name ? m.name : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={(m.first_air_date && formatYear(m.first_air_date)) || 0}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Moviestracker",
    },
  ],
};
