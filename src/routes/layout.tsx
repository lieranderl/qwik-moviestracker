import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Toolbar } from "~/components/toolbar";

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

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US"
  return {lang};
  });

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <Toolbar lang={resource.value.lang}/>
        <Slot />
    </>
  );
});
