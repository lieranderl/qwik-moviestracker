import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";
import { Toolbar } from "~/components/toolbar/toolbar";
import mongoClientPromise from "./auth/mongodbinit";
import { ObjectId } from 'bson';
// import { checkAuth } from "~/services/firestore-admin";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

//auth guard
export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session"); 
  console.log(session)
  if (!session || new Date(session.expires) < new Date() || session.error) {
    throw event.redirect(302, `/auth`);
  }
};

export const useQueryParamsLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  return { lang };
});

export default component$(() => {
  
  return (
    <>
            <Toolbar />
      <Slot />
          </>
  );
});
