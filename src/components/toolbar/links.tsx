import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
  langMovies,
  langSearch,
  langSeries,
  langTorrServer,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import type { ToolbarProps } from "./toolbar";

type AlinkProps = {
  text: string;
  path: string;
  active: boolean;
  mobile?: boolean;
};

const Alink = component$(({ text, path, active, mobile }: AlinkProps) => {
  return (
    <li>
      <a
        href={`${path}`}
        class={[
          mobile
            ? "hover:bg-base-200 rounded-btn text-sm font-medium"
            : "btn btn-ghost btn-sm rounded-btn",
          active ? "text-primary" : "text-base-content/85",
        ]}
      >
        {text}
      </a>
    </li>
  );
});

type ToolbarLinksProps = ToolbarProps & {
  mobile?: boolean;
};

export const ToolbarLinks = component$(
  ({ lang, mobile }: ToolbarLinksProps) => {
    const loc = useLocation();
    const pathname = loc.url.pathname;
    const isActive = (path: string) => {
      const basePath = path.split("?")[0];
      return pathname.startsWith(basePath);
    };

    return (
      <>
        <Alink
          text={langMovies(lang)}
          path={paths.movie(lang)}
          active={isActive(paths.movie(lang))}
          mobile={mobile}
        />
        <Alink
          text={langSeries(lang)}
          path={paths.tv(lang)}
          active={isActive(paths.tv(lang))}
          mobile={mobile}
        />
        <Alink
          text={langSearch(lang)}
          path={paths.search(lang)}
          active={isActive(paths.search(lang))}
          mobile={mobile}
        />
        <Alink
          text={langTorrServer(lang)}
          path={paths.torrserver(lang)}
          active={isActive(paths.torrserver(lang))}
          mobile={mobile}
        />
      </>
    );
  },
);
