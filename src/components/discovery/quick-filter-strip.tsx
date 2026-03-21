import {
	$,
	component$,
	useSignal,
	useOnWindow,
} from "@builder.io/qwik";

type QuickFilterItem = {
	active?: boolean;
	href: string;
	label: string;
};

type QuickFilterStripProps = {
	items: QuickFilterItem[];
	label: string;
};

export const QuickFilterStrip = component$<QuickFilterStripProps>(
	({ items, label }) => {
		const activeHref = useSignal("");

		const syncHash = $(() => {
			activeHref.value = window.location.hash;
		});
		useOnWindow("hashchange", syncHash);

		return (
			<section class="-mt-2 section-reveal mb-6 md:-mt-4 md:sticky md:top-[4.1rem] md:z-30">
				<div class="rounded-box border-base-200 bg-base-100/90 shadow-base-content/5 border px-2 py-2 shadow-sm backdrop-blur">
					<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div class="px-2 text-xs font-semibold tracking-[0.12em] uppercase text-base-content/55">
							{label}
						</div>
						<div class="no-scrollbar overflow-x-auto">
							<div class="flex min-w-max items-center gap-2">
								{items.map((item, index) => {
									const isActive = activeHref.value
										? activeHref.value === item.href
										: item.active || index === 0;

									return (
										<a
											key={item.href}
											href={item.href}
											aria-current={isActive ? "location" : undefined}
											onClick$={() => {
												activeHref.value = item.href;
											}}
											class={[
												"btn btn-sm rounded-full whitespace-nowrap transition-colors duration-200",
												isActive
													? "btn-primary"
													: "btn-ghost border-base-200 bg-base-100/70 text-base-content/75 border hover:border-primary/30 hover:bg-base-100",
											]}
										>
											{item.label}
										</a>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	},
);
