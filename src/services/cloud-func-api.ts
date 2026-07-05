import type { ImdbRating } from "./models";
import { createJsonApiClient, getOptionalResult } from "./json-api";

const baseCGURL = "https://moviestracker-gw-eu-w1-8vmmbwbl.ew.gateway.dev";
const cloudApiClient = createJsonApiClient({
	baseUrl: baseCGURL,
	defaultHeaders: {
		Origin: "https://moviestracker.net",
		Referer: "https://moviestracker.net",
	},
	name: "Cloud API",
	auth: {
		param: "key",
		value: () => process.env.GC_API_KEY,
	},
});

export const getImdbRating = (imdb_id: string) =>
	cloudApiClient.request<ImdbRating>("getimdb", {
		search: { imdb_id },
	});

export const getOptionalImdbRating = async (imdb_id?: null | string) => {
	if (!imdb_id) {
		return null;
	}

	return getOptionalResult(
		() => getImdbRating(imdb_id),
		(error) => {
			console.error(`Unable to fetch IMDb rating for ${imdb_id}`, error);
		},
	);
};
