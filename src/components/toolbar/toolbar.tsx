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
		<nav class="bg-base-100/85 border-base-200/70 text-base-content fixed top-0 left-0 z-50 w-full border-b backdrop-blur-md">
			<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
				<a href={paths.index(lang)} class="flex items-center gap-2">
					<div class="bg-base-200 rounded-box p-1.5 text-2xl">
						<HiFilmOutline />
					</div>
					<span class="self-center text-xl font-bold whitespace-nowrap">
						Moviestracker
					</span>
				</a>

				<div class="flex items-center gap-2">
					<ul class="hidden items-center gap-1 md:flex">
						<ToolbarLinks lang={lang} />
					</ul>

					<div class="flex items-center gap-2">
						<div class="rounded-btn btn btn-ghost btn-square justify-center">
							<ThemeToggle
								themeStorageKey="themePref"
								textSize="text-xl"
								lightTheme="latte"
								darkTheme="mocha"
							/>
						</div>
						<UserMenu lang={lang} />
					</div>

					<BurgerButton>
						<ToolbarLinks lang={lang} mobile={true} />
					</BurgerButton>
				</div>
			</div>
		</nav>
	);
});
