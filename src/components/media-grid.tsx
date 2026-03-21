import { component$, Slot } from "@builder.io/qwik";

interface MediaGridProps {
	title: string;
}

export const MediaGrid = component$(({ title }: MediaGridProps) => {
	return (
		<section class="my-6">
			{title && (
				<h2 class="mb-4 text-balance text-left text-xl font-semibold">{title}</h2>
			)}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
				<Slot />
			</div>
		</section>
	);
});
