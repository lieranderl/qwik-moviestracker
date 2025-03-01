import { MongoClient } from "mongodb";

export const mongoclient = (env: string) => {
	if (env.startsWith("mongodb")) {
		return new MongoClient(env);
	}
};
