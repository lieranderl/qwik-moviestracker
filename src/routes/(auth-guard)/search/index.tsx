import {
  Resource,
  component$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { MediaType } from "~/services/models";
import { search } from "~/services/tmdb";
import {
  langNoResults,
  langSearch,
  langSearchResults,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import { useQueryParamsLoader } from "~/shared/loaders";




export default component$(() => {
  const resource = useQueryParamsLoader();

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
      <div class="container mx-auto px-4 pt-[80px] text-center">
        <input
          type="text"
          class="input w-[60%] mb-4 input-bordered"
          placeholder={langSearch(resource.value.lang)}
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
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          )}
          onRejected={(error) => <div class="alert alert-error">Error: {error.message}</div>}
          onResolved={(movies) => {
            if (movies.results.length > 0) {
              return (
                <div class="my-2">
                  <MediaGrid title={langSearchResults(resource.value.lang)}>
                    {movies.results!.length > 0 &&
                      movies.results!.map((m) => (
                   
                          <a
                           key={m.id}
                            class="text-left"
                            href={paths.media(
                              m.media_type!,
                              m.id,
                              resource.value.lang,
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
                                      10,
                                    )
                                  : parseInt(
                                      "first_air_date" in m
                                        ? m.first_air_date!.substring(0, 4)
                                        : "",
                                      10,
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
                     
                      ))}
                  </MediaGrid>
                </div>
              );
            } else {
              return (
                <div class="my-2 text-sm">
                  {langNoResults(resource.value.lang)}
                </div>
              );
            }
          }}
        />
      </div>
    </>
  );
});
