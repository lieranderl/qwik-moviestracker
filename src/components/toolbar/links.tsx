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

type NavLinkProps = {
  text: string;
  path: string;
  active: boolean;
  mobile?: boolean;
};

const getPathname = (path: string) => new URL(path, "https://local").pathname;

const getLinkClass = (mobile?: boolean, active?: boolean) => [
  mobile
    ? "btn btn-ghost h-auto min-h-0 w-full justify-start rounded-xl px-3 py-2.5 text-sm font-medium normal-case shadow-none transition-colors duration-200"
    : "btn btn-ghost btn-sm h-9 min-h-9 rounded-full px-3 text-sm font-medium normal-case shadow-none transition-colors duration-200",
  active
    ? "border-base-300/70 bg-base-200/90 text-base-content border shadow-sm"
    : "text-base-content/70 hover:bg-base-200/75 hover:text-base-content",
];

const ToolbarLink = component$(
  ({ text, path, active, mobile }: NavLinkProps) => {
    return (
      <li>
        <a
          href={path}
          aria-current={active ? "page" : undefined}
          class={getLinkClass(mobile, active)}
        >
          {text}
        </a>
      </li>
    );
  },
);

type ToolbarLinksProps = ToolbarProps & {
  mobile?: boolean;
};

export const ToolbarLinks = component$(
  ({ lang, mobile }: ToolbarLinksProps) => {
    const pathname = useLocation().url.pathname;
    const navItems = [
      { text: langMovies(lang), path: paths.movie(lang) },
      { text: langSeries(lang), path: paths.tv(lang) },
      { text: langSearch(lang), path: paths.search(lang) },
      { text: langTorrServer(lang), path: paths.torrserver(lang) },
    ];

    return (
      <>
        {navItems.map(({ text, path }) => (
          <ToolbarLink
            key={path}
            text={text}
            path={path}
            active={pathname.startsWith(getPathname(path))}
            mobile={mobile}
          />
        ))}
      </>
    );
  },
);
