import {
  Resource,
  component$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DotPulseLoader } from "~/components/dot-pulse-loader/dot-pulse-loader";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { MediaType } from "~/services/models";
import { search } from "~/services/tmdb";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  return { lang };
});

export default component$(() => {
  const resource = useContentLoader();

  //   const moviesSig = [{title: "pp", id: 1, vote_average: 1, release_date: "2021-01-01", poster_path: "https://image.tmdb.org/t/p/original/6KErczPBROQty7QoIsaa6wJYXZi.jpg", media_type: "movie"}]
  const phrase = useSignal("");
  const searchResource = useResource$(async (ctx) => {
    ctx.track(() => phrase.value);
    console.log(phrase.value);

    try {
      const s = await search({
        query: phrase.value,
        language: resource.value.lang,
        page: 1,
      });
      return s;
    } catch (error) {
      throw new Error("Search failed");
    }
  });

  return (
    <>
      <div class="container text-center mx-auto px-4 pt-[80px]">
        <input
          type="text"
          class="w-[50%] mr-2 py-2 pl-2 text-sm border border-teal-300 rounded-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500 placeholder-teal-900"
          placeholder="Search here..."
          onKeyDown$={(e, elem) => {
            if (e.keyCode === 13) {
              if (elem.value.length > 2) {
                phrase.value = elem.value;
              }
            }
          }}
        />

        <Resource
          value={searchResource}
          onPending={() => (
            <div class="my-2">
              <DotPulseLoader />
            </div>
          )}
          onRejected={(error) => <div>Error: {error.message}</div>}
          onResolved={(movies) => {
            if ("results" in movies) {
              if (movies.results!.length > 0) {
                return (
                  <div class="my-2">
                    <MediaGrid title="Search Results">
                      {movies.results!.length > 0 &&
                        movies.results!.map((m) => (
                          <>
                            <a
                              class="text-left"
                              href={paths.media(
                                m.media_type!,
                                m.id,
                                resource.value.lang
                              )}
                            >
                              <MediaCard
                                title={
                                  m.media_type === MediaType.Movie
                                    ? m.title!
                                    : m.name!
                                }
                                width={300}
                                rating={m.vote_average ? m.vote_average : 0}
                                year={
                                  m.media_type === MediaType.Movie
                                    ? parseInt(
                                        m.release_date!.substring(0, 4),
                                        10
                                      )
                                    : parseInt(
                                        "first_air_date" in m
                                          ? m.first_air_date!.substring(0, 4)
                                          : "",
                                        10
                                      )
                                }
                                picfile={
                                  m.media_type != MediaType.Movie &&
                                  m.media_type != MediaType.Tv
                                    ? m.profile_path!
                                    : m.poster_path!
                                }
                                isPerson={
                                  m.media_type != MediaType.Movie &&
                                  m.media_type != MediaType.Tv
                                    ? true
                                    : false
                                }
                                isHorizontal={false}
                              />
                            </a>
                          </>
                        ))}
                    </MediaGrid>
                  </div>
                );
              } else {
                return <div class="my-2 text-sm">no results</div>;
              }
            } else {
              return <div class="my-2 text-sm">no results</div>;
            }
          }}
        />
      </div>
    </>
  );
});
