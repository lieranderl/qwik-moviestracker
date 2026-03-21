import { component$ } from "@builder.io/qwik";

export type MediaTitleProps = {
	name: string;
	original_name?: string;
};
export const MediaTitle = component$<MediaTitleProps>(
	({ name, original_name }) => {
		return (
			<header class="my-4">
				<h1 class="me-1 text-balance text-4xl font-extrabold md:text-5xl">
					{name}
				</h1>
				{original_name && original_name !== name && (
					<p class="text-base-content/70 text-lg md:text-xl">{original_name}</p>
				)}
			</header>
		);
	},
);
