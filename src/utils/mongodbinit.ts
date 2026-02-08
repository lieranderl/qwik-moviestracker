import { MongoClient } from "mongodb";

type MongoGlobal = typeof globalThis & {
	__moviesMongoClient?: MongoClient;
	__moviesMongoUri?: string;
};

export const mongoclient = (env: string) => {
	if (!env.startsWith("mongodb")) {
		return;
	}

	const globalMongo = globalThis as MongoGlobal;
	const hasReusableClient =
		globalMongo.__moviesMongoClient && globalMongo.__moviesMongoUri === env;

	if (hasReusableClient) {
		return globalMongo.__moviesMongoClient;
	}

	const client = new MongoClient(env, {
		// Keep pool bounded to avoid Atlas connection spikes under load.
		maxPoolSize: 20,
		maxIdleTimeMS: 60_000,
	});

	globalMongo.__moviesMongoClient = client;
	globalMongo.__moviesMongoUri = env;
	return client;
};
