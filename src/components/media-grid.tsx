import { component$, Slot } from "@builder.io/qwik";

interface MediaGridProps {
	title: string;
}

export const MediaGrid = component$(({ title }: MediaGridProps) => {
	return (
		<section class="my-4">
			<div class="text-xl font-semibold">{title}</div>
			<div class="xs:grid-cols-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				<Slot />
			</div>
		</section>
	);
});
