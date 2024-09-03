import { component$ } from "@builder.io/qwik";
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
};

const Alink = component$(({ text, path }: AlinkProps) => {
	return (
		<li class="mx-2">
			<a href={`${path}`} class="flex flex-col hover:text-accent link link-hover font-medium">
				{text}
			</a>
		</li>
	);
});

export const ToolbarLinks = component$(({ lang }: ToolbarProps) => {
	return (
		<>
			<Alink text={langMovies(lang)} path={paths.movie(lang)} />
			<Alink text={langSeries(lang)} path={paths.tv(lang)} />
			<Alink text={langSearch(lang)} path={paths.search(lang)} />
			<Alink text={langTorrServer(lang)} path={paths.torrserver(lang)} />
		</>
	);
});
