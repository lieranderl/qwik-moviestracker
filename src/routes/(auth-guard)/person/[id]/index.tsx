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
		<>
			{resource.value && (
				<div class="relative min-h-screen w-full">
					{resource.value.person.profile_path && (
						<div
							class="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-28 blur-[1px]"
							style={`background-image: url(https://image.tmdb.org/t/p/original${resource.value.person.profile_path});`}
						/>
					)}
					<div class="from-base-100/45 via-base-100/70 to-base-100 fixed inset-0 -z-10 bg-gradient-to-b" />

					<div class="animate-slideInFromLeft relative z-10 px-2 md:px-4">
						<PersonDetails
							person={resource.value.person}
							perMovies={resource.value.perMovies}
							perTv={resource.value.perTv}
							lang={resource.value.lang}
						/>
					</div>
				</div>
			)}
		</>
	);
});
