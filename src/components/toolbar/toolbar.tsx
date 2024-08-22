import { component$ } from "@builder.io/qwik";

import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { ThemeToggle } from "qwik-theme-toggle";
import { paths } from "~/utils/paths";
import { BurgerButton } from "./burger-button";
import { ToolbarLinks } from "./links";
import { UserMenu } from "./user-menu";

export type ToolbarProps = {
	lang: string;
};
export const Toolbar = component$<ToolbarProps>(({ lang }) => {
	return (
		<nav class="fixed z-10 block bg-opacity-50 backdrop-blur-sm dark:bg-opacity-50">
			<div class="flex w-screen flex-wrap items-center justify-between bg-opacity-100 p-4">
				<a href={paths.index(lang)} class="flex items-center">
					<div class="me-2 text-4xl">
						<HiFilmOutline />
					</div>
					<span class="self-center whitespace-nowrap text-2xl font-semibold">
						Moviestracker
					</span>
				</a>

				<div class="flex items-center">
					<div class="flex items-center gap-2 md:order-2 md:mx-4">
						<ThemeToggle themeStorageKey="themePref" textSize="text-3xl" />
						<UserMenu lang={lang} />
						<BurgerButton>
							<ToolbarLinks lang={lang} />
						</BurgerButton>
					</div>
					<ul class="me-4 hidden flex-row md:flex">
						<ToolbarLinks lang={lang} />
					</ul>
				</div>
			</div>
		</nav>
	);
});
