import { component$, Slot } from "@builder.io/qwik";

type DetailPageShellProps = {
	backdropPath?: string | null;
};

export const DetailPageShell = component$<DetailPageShellProps>(
	({ backdropPath }) => {
		const backgroundImage = backdropPath
			? `url(https://image.tmdb.org/t/p/original${backdropPath})`
			: undefined;

		return (
			<div class="page-enter relative min-h-screen w-full">
				{backgroundImage && (
					<div
						class="ambient-backdrop fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-32 blur-[1px]"
						style={{ backgroundImage }}
					/>
				)}
				<div class="from-base-100/45 via-base-100/70 to-base-100 fixed inset-0 -z-10 bg-gradient-to-b" />

				<div class="relative z-10 px-2 md:px-4">
					<Slot />
				</div>
			</div>
		);
	},
);

export const DetailPageContainer = component$(() => {
	return (
		<div class="container mx-auto min-h-screen max-w-7xl px-2 pt-6 pb-8 md:px-4 md:pt-8">
			<Slot />
		</div>
	);
});
