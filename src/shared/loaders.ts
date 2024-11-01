import { routeLoader$ } from "@builder.io/qwik-city";

// eslint-disable-next-line qwik/loader-location
export const useQueryParamsLoader = routeLoader$(async (event) => {
	const lang = event.query.get("lang") || "en-US";
	return { lang };
});
