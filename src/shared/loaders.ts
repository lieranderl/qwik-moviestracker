import { routeLoader$ } from "@builder.io/qwik-city";

// eslint-disable-next-line qwik/loader-location
export const useQueryParamsLoader = routeLoader$(async (event) => {
	const lang = event.query.get("lang") || "en-US";
	return { lang };
});

// eslint-disable-next-line qwik/loader-location
export const useEnv = routeLoader$(async ({ env }) => {
	const envMongoUrl = env.get("MONGO_URI") ?? "";
	return { envMongoUrl };
});
