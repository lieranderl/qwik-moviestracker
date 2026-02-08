import { mongoclient } from "~/utils/mongodbinit";
import type { MovieMongo } from "./models";

export enum DbType {
	LastMovies = "latesttorrentsmovies",
	HDR10 = "hdr10movies",
	DV = "dvmovies",
}

type getMovieMongoType = {
	entries_on_page: number;
	dbName: string;
	page: number;
	language?: string;
	env: string;
};

export const getMoviesMongo = async ({
	entries_on_page,
	dbName,
	page,
	language,
	env,
}: getMovieMongoType) => {
	const client = await mongoclient(env);
	if (!client) {
		throw new Error("Mongo client is not initialized");
	}
	const connectedClient = await client.connect();
	const mdb = connectedClient.db("movies");
	const col = mdb.collection(dbName);
	const cursor = col
		.find()
		.sort({ lasttimefound: -1, id: -1 })
		.skip(entries_on_page * (page - 1))
		.limit(entries_on_page);
	const movies: MovieMongo[] = [];
	for await (const m of cursor) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, ...mymovie } = m;
		if (language) {
			if (language === "en-US") {
				mymovie.title = mymovie.original_title;
			}
		}
		movies.push(mymovie as MovieMongo);
	}
	return movies;
};
