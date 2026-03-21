import { component$, Resource, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState, LoadingState } from "~/components/page-feedback";
import { PersonDetails } from "~/components/person-details/person-details";
import type { PersonFull, PersonMedia } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getPersonMovies, getPersonTv } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";

export const useContentLoader = routeLoader$(async (event) => {
	const id = Number.parseInt(event.params.id, 10);
	return { id };
});

export default component$(() => {
	const lang = useQueryParamsLoader().value.lang;
	const id = useContentLoader().value.id;
	const usePersonDetails = useResource$(async () => {
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
			return { person, perMovies, perTv, lang };
		} catch (error) {
			console.error(error);
			throw new Error("Person details could not be loaded.");
		}
	});

	return (
		<Resource
			value={usePersonDetails}
			onPending={() => (
				<LoadingState
					title="Loading person details"
					description="We are fetching biography, credits, and known-for titles."
				/>
			)}
			onRejected={(error) => (
				<ErrorState
					title="Person details are unavailable"
					description={error.message}
				/>
			)}
			onResolved={(value) => (
				<DetailPageShell backdropPath={value.person.profile_path}>
					<PersonDetails
						person={value.person}
						perMovies={value.perMovies}
						perTv={value.perTv}
						lang={value.lang}
					/>
				</DetailPageShell>
			)}
		/>
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
