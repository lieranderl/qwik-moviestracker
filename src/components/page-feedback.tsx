import { component$, Slot } from "@builder.io/qwik";
import {
	HiExclamationTriangleSolid,
	HiInformationCircleSolid,
	HiXCircleSolid,
} from "@qwikest/icons/heroicons";

type FeedbackCardProps = {
	title: string;
	description?: string;
	compact?: boolean;
};

export const LoadingState = component$<FeedbackCardProps>(
	({ title, description, compact = false }) => {
		return (
			<section
				aria-live="polite"
				class={[
					"container mx-auto px-4 overlay-enter",
					compact ? "py-6" : "flex min-h-[40vh] items-center justify-center py-8",
				]}
			>
				<div class="card border-base-200 bg-base-100/95 w-full max-w-xl border shadow-sm">
					<div class="card-body items-center text-center">
						<span class="loading loading-spinner loading-lg" />
						<h2 class="text-lg font-semibold">{title}</h2>
						{description && (
							<p class="text-base-content/70 max-w-md text-sm leading-relaxed">
								{description}
							</p>
						)}
					</div>
				</div>
			</section>
		);
	},
);

export const ErrorState = component$<FeedbackCardProps>(
	({ title, description, compact = false }) => {
		return (
			<section
				aria-live="polite"
				class={[
					"container mx-auto px-4 overlay-enter",
					compact ? "py-6" : "flex min-h-[40vh] items-center justify-center py-8",
				]}
			>
				<div
					role="alert"
					class="card border-error/30 bg-base-100/95 w-full max-w-xl border shadow-sm"
				>
					<div class="card-body items-center text-center">
						<HiXCircleSolid class="text-error h-10 w-10" />
						<h2 class="text-lg font-semibold">{title}</h2>
						{description && (
							<p class="text-base-content/70 max-w-md text-sm leading-relaxed">
								{description}
							</p>
						)}
					</div>
				</div>
			</section>
		);
	},
);

export const EmptyState = component$<FeedbackCardProps>(
	({ title, description, compact = false }) => {
		return (
			<section
				aria-live="polite"
				class={[
					"container mx-auto px-4 overlay-enter",
					compact ? "py-6" : "flex min-h-[32vh] items-center justify-center py-8",
				]}
			>
				<div class="card border-base-200 bg-base-100/95 w-full max-w-xl border shadow-sm">
					<div class="card-body items-center text-center">
						<HiInformationCircleSolid class="text-info h-10 w-10" />
						<h2 class="text-lg font-semibold">{title}</h2>
						{description && (
							<p class="text-base-content/70 max-w-md text-sm leading-relaxed">
								{description}
							</p>
						)}
					</div>
				</div>
			</section>
		);
	},
);

export const SectionHeading = component$<{ eyebrow?: string; title: string }>(
	({ eyebrow, title }) => {
		return (
			<header class="section-reveal mb-5 space-y-2 text-left">
				{eyebrow && (
					<p class="text-base-content/60 text-xs font-semibold tracking-[0.12em] uppercase">
						{eyebrow}
					</p>
				)}
				<h1 class="text-balance text-3xl font-bold tracking-tight md:text-4xl">
					{title}
				</h1>
			</header>
		);
	},
);

export const InlineFilterGroup = component$(() => {
	return (
		<div class="flex flex-wrap items-center gap-2">
			<Slot />
		</div>
	);
});

export const FilterChip = component$<{ label: string }>(({ label }) => {
	return (
		<span class="badge border-base-300/80 bg-base-200/60 text-base-content/70 pointer-events-none h-8 rounded-full px-3 font-medium shadow-none">
			{label}
		</span>
	);
});

export const EmptyInlineNotice = component$<{ message: string }>(
	({ message }) => {
		return (
			<div class="rounded-box border-base-200 bg-base-100/80 flex items-center gap-2 border px-4 py-3 text-sm">
				<HiExclamationTriangleSolid class="text-warning h-5 w-5" />
				<span class="text-base-content/75">{message}</span>
			</div>
		);
	},
);
