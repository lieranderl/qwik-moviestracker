import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { ButtonPrimary, ButtonSize } from "~/components/button-primary";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { MediaShort, MovieMongo, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia } from "~/services/tmdb";
import { categoryToDb, categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  if (event.params.name === "trending") {
    try {
      const res = await getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: false,
      });
      return {
        movies: res as MovieShort[],
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      throw event.redirect(302, paths.notFound(lang));
    }
  } else {
    try {
      console.log("get mongo movies");
      const [movies] = await Promise.all([
        getMoviesMongo({
          entries_on_page: 20,
          dbName: categoryToDb(event.params.name),
          page: 1,
          language: lang,
        }),
      ]);
      return {
        movies: movies as MovieMongo[],
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      console.log(error);
      throw event.redirect(302, paths.notFound(lang));
    }
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const moviesSig = useSignal(resource.value.movies as MediaShort[]);
  const isloadingMovies = useSignal(false);
  const pageSig = useSignal(1);

  const getNewMovies = $(async () => {
    isloadingMovies.value = true;
    moviesSig.value = (await server$(async () => {
      if (resource.value.category === "trending") {
        const m = (await getTrendingMedia({
          page: pageSig.value,
          language: resource.value.lang,
          type: MediaType.Movie,
          needbackdrop: false,
        })) as MediaShort[];
        moviesSig.value.push(...m);
        return moviesSig.value;
      } else {
        return getMoviesMongo({
          entries_on_page: 20,
          dbName: categoryToDb(resource.value.category),
          page: pageSig.value,
          language: resource.value.lang,
        });
      }
    })()) as MediaShort[];
    isloadingMovies.value = false;
  });

  useVisibleTask$(async ({ track }) => {
    track(() => {
      pageSig.value;
    });
    console.log("pageSig.value", pageSig.value);
    if (pageSig.value > 1) {
      getNewMovies();
    }
  });

  return (
    <div class="container mx-auto px-4 pt-[64px]">
      <MediaGrid
        title={categoryToTitle(
          resource.value.category,
          MediaType.Movie,
          resource.value.lang
        )}
      >
        {moviesSig.value.length > 0 &&
          moviesSig.value.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={300}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={
                    m.year
                      ? parseInt(m.year)
                      : parseInt(
                          m.release_date ? m.release_date.substring(0, 4) : "0",
                          10
                        )
                  }
                  picfile={m.poster_path}
                  isPerson={false}
                  isHorizontal={false}
                />
              </a>
            </>
          ))}
      </MediaGrid>
      <div class="flex justify-center my-4">
        <ButtonPrimary
          text="Load more"
          onClick={$(() => {
            pageSig.value = pageSig.value + 1;
          })}
          isLoading={isloadingMovies.value}
          size={ButtonSize.lg}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Catalog of movies",
    },
  ],
};
