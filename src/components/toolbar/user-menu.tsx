import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { useSession, useSignOut } from "~/routes/plugin@auth";
import { langSingOut } from "~/utils/languages";
import { LangButton } from "./lang-button";
import type { ToolbarProps } from "./toolbar";

export const UserMenu = component$(({ lang }: ToolbarProps) => {
	const session = useSession();
	const signOut = useSignOut();

	return (
		<div class="ml-1">
			{session.value && (
				<div class="dropdown dropdown-end dropdown-bottom">
					<button type="button" class="btn btn-ghost btn-circle avatar">
						<div class="border-base-200 bg-base-100 w-8 rounded-full border">
							{session.value.user && (
								<Image src={session.value.user.image} alt="user photo" />
							)}
						</div>
					</button>
					<ul class="menu dropdown-content rounded-box bg-base-100 border-base-200 z-[1] mt-2 w-56 border p-2 shadow-lg">
						{session.value.user && (
							<div class="px-3 py-2">
								<span class="block text-sm font-medium">
									{session.value.user.name}
								</span>
								<span class="text-base-content/65 block truncate text-sm">
									{session.value.user.email}
								</span>
							</div>
						)}
						<li class="menu-title px-3 py-0 text-[10px] uppercase opacity-60">
							<span>Preferences</span>
						</li>
						<LangButton />
						<li>
							<div class="divider my-0" />
						</li>
						<li>
							<button
								type="button"
								onClick$={() => signOut.submit({ redirectTo: "/auth" })}
							>
								{langSingOut(lang)}
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
});
