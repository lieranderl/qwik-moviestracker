import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { formatYear, showYearOld, showDeathYear } from "~/utils/fomat";
import { paths } from "~/utils/paths";
import { MediaCard } from "./media-card";
import { MediaCarousel } from "./media-carousel";
import { FemaleSVG } from "~/utils/icons/femaleSVG";
import { MaleSVG } from "~/utils/icons/maleSVG";
import { NonbiSVG } from "~/utils/icons/nonbiSVG";
import { PlaceSVG } from "~/utils/icons/placeSVG";
import { PersonSVG } from "~/utils/icons/personSVG";
import { Image } from "@unpic/qwik";
import { ExternalIds } from "./external_ids";
import type { PersonMedia } from "~/services/models";
import { type PersonFull, MediaType } from "~/services/models";

interface MovieDetailsProps {
  person: PersonFull;
  perMovies: PersonMedia;
  perTv: PersonMedia;
  lang: string;
}

export const PersonDetails = component$(
  ({ person, perMovies, perTv, lang }: MovieDetailsProps) => {
    const isShowBio = useSignal(false);
    const bioSize = useSignal(300);

    useVisibleTask$(async () => {
      window.addEventListener("resize", function (event) {
        const t = event.target ? (event.target as Window) : null;
        if (t && t.innerWidth) {
          if (t.innerWidth > 1200) {
            bioSize.value = 700;
          } else if (t.innerWidth > 900 && t.innerWidth < 1200) {
            bioSize.value = 500;
          } else {
            bioSize.value = 300;
          }
        }
      });
    });

    return (
      <div class="pt-[64px] lg:mx-20 xl:mx-40 font-normal">
        <section class="md:grid md:grid-rows-1 md:grid-flow-col flex-wrap md:gap-8 ">
          {person.profile_path && (
            <div class="flex w-full justify-center md:block">
              <Image
                width="300"
                height="450"
                src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                class="rounded"
                alt={person.name}
              />
            </div>
          )}
          <div class="mt-4 md:mt-0">
            <div class="text-2xl font-bold flex items-center">
              {person.name}
              <div class="font-extralight ml-2 fill-teal-950 dark:fill-teal-50">
                {person.gender === 1 && <FemaleSVG />}
                {person.gender === 2 && <MaleSVG />}
                {person.gender === 0 && <NonbiSVG />}
              </div>
            </div>
            <section class="my-2">
              {person.place_of_birth && (
                <div class="text-md flex items-center">
                  <PlaceSVG />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
              {!person.deathday && (
                <div class="text-md flex items-center">
                  <PersonSVG />
                  <span>
                    {person.birthday} ({showYearOld(person.birthday!)})
                  </span>
                </div>
              )}

              {person.deathday && (
                <div class="text-md flex items-center">
                  <PersonSVG />
                  <span>
                    {person.birthday} &ndash; {person.deathday}(
                    {showDeathYear(person.birthday!, person.deathday)})
                  </span>
                </div>
              )}
            </section>

            <ExternalIds external_ids={person.external_ids} type={"person"} />

            {person.biography && person.biography.length > bioSize.value && (
              <>
                {!isShowBio.value && (
                  <div class="">
                    {person.biography.substring(0, bioSize.value)}...
                  </div>
                )}
                {isShowBio.value && <div class="">{person.biography}</div>}
                <a
                  class="text-sm float-right text-teal-600 underline dark:text-teal-500 hover:cursor-pointer"
                  onClick$={() => (isShowBio.value = !isShowBio.value)}
                >
                  {!isShowBio.value && <span>Read more...</span>}
                  {isShowBio.value && <span>Read less...</span>}
                </a>
              </>
            )}

            {person.biography && person.biography.length < 300 && (
              <div>{person.biography}</div>
            )}
          </div>
        </section>
        <section class="mt-8">
          {perMovies.cast.length > 0 && (
            <MediaCarousel
              title="Actor in Movies"
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perMovies.cast.map((m) => (
                <>
                  <a href={paths.media(MediaType.Movie, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={(m.release_date && formatYear(m.release_date)) || 0}
                      picfile={m.poster_path}
                      isPerson={false}
                      isHorizontal={false}
                      charName={m.character}
                    />
                  </a>
                </>
              ))}
            </MediaCarousel>
          )}

          {perTv.cast.length > 0 && (
            <MediaCarousel
              title="Actor in TV Shows"
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perTv.cast.map((m) => (
                <>
                  <a href={paths.media(MediaType.Tv, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={
                        (m.first_air_date && formatYear(m.first_air_date)) || 0
                      }
                      picfile={m.poster_path}
                      isPerson={false}
                      isHorizontal={false}
                      charName={m.character}
                    />
                  </a>
                </>
              ))}
            </MediaCarousel>
          )}

          {perMovies.crew.length > 0 && (
            <MediaCarousel
              title="Production Movies"
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perMovies.crew.map((m) => (
                <>
                  <a href={paths.media(MediaType.Movie, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={
                        (m.first_air_date && formatYear(m.first_air_date)) || 0
                      }
                      picfile={m.poster_path}
                      isPerson={false}
                      isHorizontal={false}
                      charName={m.job}
                    />
                  </a>
                </>
              ))}
            </MediaCarousel>
          )}

          {perTv.crew.length > 0 && (
            <MediaCarousel
              title="Production TV Shows"
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perTv.crew.map((m) => (
                <>
                  <a href={paths.media(MediaType.Tv, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={
                        (m.first_air_date && formatYear(m.first_air_date)) || 0
                      }
                      picfile={m.poster_path}
                      isPerson={false}
                      isHorizontal={false}
                      charName={m.job}
                    />
                  </a>
                </>
              ))}
            </MediaCarousel>
          )}
        </section>
      </div>
    );
  }
);
