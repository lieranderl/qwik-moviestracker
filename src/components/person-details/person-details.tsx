import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  BsGenderFemale,
  BsGenderMale,
  BsGenderTrans,
} from "@qwikest/icons/bootstrap";
import { Image } from "@unpic/qwik";
import { DetailPageContainer } from "~/components/detail-page-layout";
import type { PersonMedia } from "~/services/models";
import { MediaType, type PersonFull } from "~/services/models";
import { formatYear } from "~/utils/format";
import { langText } from "~/utils/languages";
import { paths } from "~/utils/paths";
import { writeLastViewed } from "~/utils/recent-activity";
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

const sectionCardClass =
  "card border-base-200 bg-base-100/95 border shadow-sm";
const sectionBodyClass = "card-body gap-4 p-4 md:p-6";

export const PersonDetails = component$(
  ({ person, perMovies, perTv, lang }: MovieDetailsProps) => {
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      writeLastViewed({
        href: paths.media(MediaType.Person, person.id, lang),
        title: person.name ?? langText(lang, "Person details", "Детали персоны"),
        kind: "person",
        meta: person.known_for_department || langText(lang, "Person", "Персона"),
        imagePath: person.profile_path,
      });
    });

    return (
      <DetailPageContainer>
        {/* ── HERO: Profile Image + Name + Personal Info ── */}
        <section class={`${sectionCardClass} sm:card-side`}>
          <figure class="mx-auto w-48 shrink-0 p-4 pb-0 sm:mx-0 sm:w-56 sm:p-6 sm:pr-0 lg:w-64">
            {person.profile_path ? (
              <Image
                width="300"
                height="450"
                src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                alt={person.name}
                class="rounded-box h-auto w-full shadow-lg"
              />
            ) : (
              <div class="bg-base-200 rounded-box flex aspect-2/3 w-full items-center justify-center">
                <span class="text-base-content/20 text-5xl select-none" aria-hidden="true">
                  👤
                </span>
              </div>
            )}
          </figure>

          <div class={`${sectionBodyClass} min-w-0 flex-1`}>
            {/* Name + Gender */}
            <header>
              <h1 class="me-1 flex items-center gap-2 text-3xl font-bold md:text-4xl">
                <span>{person.name}</span>
                <span class="text-base-content/40 text-xl" aria-hidden="true">
                  {person.gender === 1 && <BsGenderFemale />}
                  {person.gender === 2 && <BsGenderMale />}
                  {person.gender === 3 && <BsGenderTrans />}
                </span>
              </h1>
              {person.known_for_department && (
                <span class="badge badge-outline badge-sm mt-1">
                  {person.known_for_department}
                </span>
              )}
            </header>

            {/* Personal Info */}
            <div class="space-y-3">
              <h2 class="text-base-content/70 text-sm font-semibold uppercase tracking-wide">
                {langText(lang, "Personal info", "Личная информация")}
              </h2>
              <PersonDate
                place_of_birth={person.place_of_birth}
                birthday={person.birthday}
                deathday={person.deathday}
              />
            </div>
          </div>
        </section>

        <div class="divider" />

        {/* ── EXTERNAL LINKS ── */}
        <ExternalIds
          external_ids={person.external_ids}
          lang={lang}
          type={"person"}
        />

        <div class="divider" />

        {/* ── BIOGRAPHY ── */}
        <section class={sectionCardClass}>
          <div class={sectionBodyClass}>
            <h2 class="card-title text-xl">
              {langText(lang, "Biography", "Биография")}
            </h2>
            <PersonBio biography={person.biography} lang={lang} />
          </div>
        </section>

        <div class="divider" />

        {/* ── FILMOGRAPHY ── */}
        <div class="space-y-6">
          {perMovies.cast.length > 0 && (
            <MediaCarousel
              title={langText(lang, "Actor in movies", "Актер в фильмах")}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perMovies.cast.map((m) => (
                <div class="carousel-item" key={m.id}>
                  <a
                    href={paths.media(MediaType.Movie, m.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={formatYear(m.release_date)}
                      picfile={m.poster_path}
                      variant="poster"
                      metaLabel={m.character}
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}

          {perTv.cast.length > 0 && (
            <MediaCarousel
              title={langText(lang, "Actor in TV shows", "Актер в сериалах")}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perTv.cast.map((m) => (
                <div class="carousel-item" key={m.id}>
                  <a
                    href={paths.media(MediaType.Tv, m.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={m.name ? m.name : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={formatYear(m.first_air_date)}
                      picfile={m.poster_path}
                      variant="poster"
                      metaLabel={m.character}
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}

          {perMovies.crew.length > 0 && (
            <MediaCarousel
              title={langText(lang, "Production movies", "Работы в кино")}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perMovies.crew.map((m) => (
                <div class="carousel-item" key={m.id}>
                  <a
                    href={paths.media(MediaType.Movie, m.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={formatYear(m.release_date)}
                      picfile={m.poster_path}
                      variant="poster"
                      metaLabel={m.job}
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}

          {perTv.crew.length > 0 && (
            <MediaCarousel
              title={langText(lang, "Production TV shows", "Работы в сериалах")}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {perTv.crew.map((m) => (
                <div class="carousel-item" key={m.id}>
                  <a
                    href={paths.media(MediaType.Tv, m.id, lang)}
                    class="media-card-link"
                  >
                    <MediaCard
                      title={m.name ? m.name : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={formatYear(m.first_air_date)}
                      picfile={m.poster_path}
                      variant="poster"
                      metaLabel={m.job}
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
