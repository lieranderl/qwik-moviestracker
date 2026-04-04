import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { PersonDetails } from "~/components/person-details/person-details";
import {
  createDevPersonDetail,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type { PersonFull, PersonMedia } from "~/services/models";
import {
  getPersonDetails,
  getPersonMovies,
  getPersonTv,
} from "~/services/tmdb";
import { langText } from "~/utils/languages";

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

  const devPersonDetail = createDevPersonDetail({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    id,
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devPersonDetail) {
    return {
      status: "ready",
      ...devPersonDetail,
    } satisfies PersonDetailData;
  }

  try {
    const [person, perMovies, perTv] = await Promise.all([
      getPersonDetails({
        id,
        language: lang,
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
        title={langText(
          value.lang,
          "Person details are unavailable",
          "Детали персоны недоступны",
        )}
        description={langText(
          value.lang,
          "Please refresh the page or return to the previous screen.",
          "Обновите страницу или вернитесь на предыдущий экран.",
        )}
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

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "Person details",
      "Детали персоны",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(lang, "Person details", "Детали персоны"),
      },
    ],
  };
};
