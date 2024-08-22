import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PersonDetails } from "~/components/person-details/person-details";
import type { PersonFull } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getPersonMovies, getPersonTv } from "~/services/tmdb";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
	const lang = event.query.get("lang") || "en-US";
	const id = Number.parseInt(event.params.id, 10);
	try {
		const [person, perMovies, perTv] = await Promise.all([
			getMediaDetails({
				id,
				language: lang,
				type: MediaType.Person,
			}) as Promise<PersonFull>,
			// getPerson({
			//   id,
			//   language: lang,
			// }),
			getPersonMovies({ id: id, language: lang }),
			getPersonTv({ id: id, language: lang }),
		]);
		return { person, perMovies, perTv, lang };
	} catch (error) {
		console.error(error);
		event.redirect(302, paths.notFound(lang));
	}
});

export default component$(() => {
	const resource = useContentLoader();

	return (
		<div class="container mx-auto px-4 pt-[100px]">
			{resource.value && (
				<PersonDetails
					person={resource.value.person}
					perMovies={resource.value.perMovies}
					perTv={resource.value.perTv}
					lang={resource.value.lang}
				/>
			)}
		</div>
	);
});
