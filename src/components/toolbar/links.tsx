import { component$ } from "@builder.io/qwik";
import { useQueryParamsLoader } from "~/routes/layout";
import {
  langMovies,
  langSearch,
  langSeries,
  langTorrServer,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

type AlinkProps = {
  text: string;
  path: string;
};

const Alink = component$(({ text, path }: AlinkProps) => {
  return (
    <li class="mx-4">
      <a href={`${path}`} class="group transition duration-300">
        {text}
        <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-primary-dark dark:bg-primary"></span>
      </a>
    </li>
  );
});

export const ToolbarLinks = component$(() => {
  const resource = useQueryParamsLoader();

  return (
    <>
      <Alink
        text={langMovies(resource.value.lang)}
        path={paths.movie(resource.value.lang)}
      />
      <Alink
        text={langSeries(resource.value.lang)}
        path={paths.tv(resource.value.lang)}
      />
      <Alink
        text={langSearch(resource.value.lang)}
        path={paths.search(resource.value.lang)}
      />
      <Alink
        text={langTorrServer(resource.value.lang)}
        path={paths.torrserver(resource.value.lang)}
      />
    </>
  );
});
