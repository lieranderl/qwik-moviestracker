import mongoClientPromise from "~/utils/mongodbinit";
import type { MovieMongo } from "./models";

const moviesDB = (await mongoClientPromise).db("movies");

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
};

export const getMoviesMongo = async ({
	entries_on_page,
	dbName,
	page,
	language,
}: getMovieMongoType) => {
	const col = moviesDB.collection(dbName);
	const cursor = col
		.find()
		.sort({ lasttimefound: -1, id: -1 })
		.skip(entries_on_page * (page - 1))
		.limit(entries_on_page);
	const movies: MovieMongo[] = [];
	for await (const m of cursor) {
		const { _id, ...mymovie } = m;
		_id;
		if (language) {
			if (language === "en-US") {
				mymovie.title = mymovie.original_title;
			}
		}
		movies.push(mymovie as MovieMongo);
	}
	return movies;
};
