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
      return search({
        query: phrase.value,
        language: resource.value.lang,
        page: 1,
      });
    } catch (error) {
      throw new Error("Search failed");
    }
  });

  return (
    <>
      <div class="container mx-auto px-4 pt-[80px]">
        <input
          type="text"
          class="mr-2 py-2 pl-2 text-sm border border-teal-300 rounded-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
          placeholder="Search here..."
          onChange$={(e) => {
            if (e.target.value.length > 2) {
              phrase.value = e.target.value;
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
                              href={paths.media(
                                m.media_type as "movie" | "tv" | "person",
                                m.id,
                                resource.value.lang
                              )}
                            >
                              <MediaCard
                                title={
                                  m.media_type === "movie" ? m.title : m.name
                                }
                                width={300}
                                rating={m.vote_average}
                                year={
                                  m.media_type === "movie"
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
                                picfile={(m.media_type != "movie" && m.media_type != "tv") ? m.profile_path!: m.poster_path}
                                isPerson={(m.media_type != "movie" && m.media_type != "tv") ? true : false}
                                isHorizontal={false}
                              />
                            </a>
                          </>
                        ))}
                    </MediaGrid>
                  </div>
                );
              } else {
                return <div class="my-2">no result</div>;
              }
            } else {
              return <div class="my-2">no result</div>;
            }
          }}
        />
      </div>
    </>
  );
});

{
  /* <MediaGrid title="Search Results">
{movies.results!.length > 0 &&
  movies.results!.map((m) => (
    <>
      <a
        href={paths.media(
          m.media_type as "movie" | "tv" | "person",
          m.id,
          resource.value.lang
        )}
      >
        <MediaCard
          title={m.media_type === "movie" ? m.title : m.name}
          width={300}
          rating={m.vote_average!}
          year={
            m.media_type === "movie"
              ? parseInt(m.release_date!.substring(0, 4), 10)
              : parseInt(
                  m.first_air_date!.substring(0, 4),
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
</MediaGrid> */
}
