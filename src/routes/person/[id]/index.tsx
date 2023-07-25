import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  return { lang, id };
});

export default component$(() => {
  const resource = useContentLoader();

  return <div>person {resource.value.id}</div>;
});
