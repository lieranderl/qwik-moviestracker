import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { PersonDetails } from "~/components/person-details/person-details";
import type { PersonFull, PersonMedia } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getPersonMovies, getPersonTv } from "~/services/tmdb";

type PersonDetailData =
  | {
      status: "ready";
      lang: string;
      person: PersonFull;
      perMovies: PersonMedia;
      perTv: PersonMedia;
    }
  | {
      status: "error";
      lang: string;
    };

export const usePersonDetailLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = Number.parseInt(event.params.id, 10);

  if (Number.isNaN(id)) {
    return {
      status: "error",
      lang,
    } satisfies PersonDetailData;
  }

  try {
    const [person, perMovies, perTv] = await Promise.all([
      getMediaDetails({
        id,
        language: lang,
        type: MediaType.Person,
      }) as Promise<PersonFull>,
      getPersonMovies({ id, language: lang }) as Promise<PersonMedia>,
      getPersonTv({ id, language: lang }) as Promise<PersonMedia>,
    ]);

    return {
      status: "ready",
      lang,
      person,
      perMovies,
      perTv,
    } satisfies PersonDetailData;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      lang,
    } satisfies PersonDetailData;
  }
});

export default component$(() => {
  const value = usePersonDetailLoader().value;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title="Person details are unavailable"
        description="Please refresh the page or return to the previous screen."
      />
    );
  }

  return (
    <DetailPageShell backdropPath={value.person.profile_path}>
      <PersonDetails
        person={value.person}
        perMovies={value.perMovies}
        perTv={value.perTv}
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
      content: "Person Details",
    },
  ],
};
