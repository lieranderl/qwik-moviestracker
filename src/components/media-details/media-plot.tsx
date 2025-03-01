import { component$ } from "@builder.io/qwik";

export type MediaPlotProps = {
	overview?: string;
	tagline?: string;
};

export const MediaPlot = component$<MediaPlotProps>(({ overview, tagline }) => {
	return (
		<section class="my-8">
			{overview && <div>{overview}</div>}
			{tagline && (
				<blockquote class="text-right text-sm font-semibold italic">
					<p class="text-sm font-medium italic leading-relaxed">{tagline}</p>
				</blockquote>
			)}
		</section>
	);
});
