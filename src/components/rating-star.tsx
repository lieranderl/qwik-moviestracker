import { component$ } from "@builder.io/qwik";

export type RatingStarProps = {
	containerClass?: string;
	iconClass?: string;
};

const BASE_CONTAINER_CLASS = "inline-flex h-4 w-4 items-center justify-center";
const BASE_ICON_CLASS = "h-3.5 w-3.5";

export const RatingStar = component$<RatingStarProps>(
	({ containerClass, iconClass }) => {
		const mergedContainerClass = containerClass
			? `${BASE_CONTAINER_CLASS} ${containerClass}`
			: BASE_CONTAINER_CLASS;
		const mergedIconClass = iconClass || BASE_ICON_CLASS;

		return (
			<span class={mergedContainerClass}>
				<svg
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					class={mergedIconClass}
				>
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.291c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.196-1.539-1.118l1.07-3.291a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
				</svg>
			</span>
		);
	},
);
