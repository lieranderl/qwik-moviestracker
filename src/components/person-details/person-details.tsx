import { component$ } from "@builder.io/qwik";
import {
  BsGenderFemale,
  BsGenderMale,
  BsGenderTrans,
} from "@qwikest/icons/bootstrap";
import { Image } from "@unpic/qwik";
import type { PersonMedia } from "~/services/models";
import { MediaType, type PersonFull } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import { paths } from "~/utils/paths";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { PersonBio } from "./person-bio";
import { PersonDate } from "./person-date";

interface MovieDetailsProps {
  person: PersonFull;
  perMovies: PersonMedia;
  perTv: PersonMedia;
  lang: string;
}

export const PersonDetails = component$(
  ({ person, perMovies, perTv, lang }: MovieDetailsProps) => {
    return (
      <div class="container mx-auto min-h-screen max-w-7xl px-2 pt-[18vh] pb-8 md:px-4">
        <section class="card border-base-200 bg-base-100/95 border shadow-sm">
          <div class="card-body">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
              <div class="flex justify-center md:justify-start">
                {person.profile_path ? (
                  <Image
                    width="300"
                    height="450"
                    src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                    class="border-base-200 aspect-[2/3] w-[180px] rounded-xl border object-cover shadow-sm md:w-[220px]"
                    alt={person.name}
                  />
                ) : (
                  <div class="border-base-200 bg-base-200 text-base-content/55 flex aspect-[2/3] w-[180px] items-center justify-center rounded-xl border text-sm font-medium shadow-sm md:w-[220px]">
                    No image
                  </div>
                )}
              </div>

              <div class="space-y-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-3xl font-bold">
                    <span>{person.name}</span>
                    <span class="text-base-content/60 text-xl font-light">
                      {person.gender === 1 && <BsGenderFemale />}
                      {person.gender === 2 && <BsGenderMale />}
                      {person.gender === 3 && <BsGenderTrans />}
                    </span>
                  </div>
                  {person.known_for_department && (
                    <span class="badge badge-outline badge-sm">
                      {person.known_for_department}
                    </span>
                  )}
                </div>

                <section class="card border-base-200 bg-base-100 border shadow-none">
                  <div class="card-body p-4">
                    <h3 class="card-title text-base-content/80 text-lg">
                      Personal Info
                    </h3>
                    <PersonDate
                      place_of_birth={person.place_of_birth}
                      birthday={person.birthday}
                      deathday={person.deathday}
                    />
                  </div>
                </section>

                <ExternalIds
                  external_ids={person.external_ids}
                  type={"person"}
                />
              </div>
            </div>
          </div>
        </section>

        <section class="card border-base-200 bg-base-100/95 mt-6 border shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg">Biography</h3>
            <PersonBio biography={person.biography} />
          </div>
        </section>

        <section class="mt-10 space-y-10">
          {perMovies.cast.length > 0 && (
            <MediaCarousel
              title="Actor in Movies"
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perMovies.cast.map((m) => (
                <div class="carousel-item" key={m.id}>
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
                </div>
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
                <div class="carousel-item" key={m.id}>
                  <a href={paths.media(MediaType.Tv, m.id, lang)}>
                    <MediaCard
                      title={m.name ? m.name : ""}
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
                </div>
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
                <div class="carousel-item" key={m.id}>
                  <a href={paths.media(MediaType.Movie, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={(m.release_date && formatYear(m.release_date)) || 0}
                      picfile={m.poster_path}
                      isPerson={false}
                      isHorizontal={false}
                      charName={m.job}
                    />
                  </a>
                </div>
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
                <div class="carousel-item" key={m.id}>
                  <a href={paths.media(MediaType.Tv, m.id, lang)}>
                    <MediaCard
                      title={m.name ? m.name : ""}
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
                </div>
              ))}
            </MediaCarousel>
          )}
        </section>
      </div>
    );
  },
);
