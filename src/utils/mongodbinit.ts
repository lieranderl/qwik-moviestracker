import type { MongoClient as MongoClientType } from "mongodb";

type MongoGlobal = typeof globalThis & {
  __moviesMongoClient?: MongoClientType;
  __moviesMongoUri?: string;
  __moviesMongoPromise?: Promise<MongoClientType>;
};

export const mongoclient = async (env: string) => {
  if (!env.startsWith("mongodb")) {
    return;
  }

  const globalMongo = globalThis as MongoGlobal;

  // Reuse an existing connected client if the URI hasn't changed and the
  // topology is still healthy.
  if (globalMongo.__moviesMongoClient && globalMongo.__moviesMongoUri === env) {
    const client = globalMongo.__moviesMongoClient;
    const topology = (client as { topology?: { isConnected?: () => boolean } })
      .topology;
    if (topology?.isConnected?.()) {
      return client;
    }
  }

  // Deduplicate concurrent connection attempts so multiple in-flight requests
  // during HMR or cold start don't create duplicate clients.
  if (globalMongo.__moviesMongoPromise) {
    return globalMongo.__moviesMongoPromise;
  }

  globalMongo.__moviesMongoPromise = (async () => {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(env, {
      // Keep pool bounded to avoid Atlas connection spikes under load.
      maxPoolSize: 20,
      maxIdleTimeMS: 60_000,
    });

    await client.connect();

    globalMongo.__moviesMongoClient = client;
    globalMongo.__moviesMongoUri = env;
    return client;
  })();

  const client = await globalMongo.__moviesMongoPromise;
  globalMongo.__moviesMongoPromise = undefined;
  return client;
};
