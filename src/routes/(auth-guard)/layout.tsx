import type { Session } from "@auth/core/types";
import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Toolbar } from "~/components/toolbar/toolbar";

export { useEnv, useQueryParamsLoader } from "~/shared/loaders";

import { useQueryParamsLoader } from "~/shared/loaders";

export const onGet: RequestHandler = async ({ cacheControl }) => {
	// Control caching for this request for best performance and to reduce hosting costs:
	// https://qwik.builder.io/docs/caching/
	cacheControl({
		// Always serve a cached response by default, up to a week stale
		staleWhileRevalidate: 60 * 60 * 24 * 7,
		// Max once every 5 seconds, revalidate on the server to get a fresh version of this page
		maxAge: 5,
	});
};

//auth guard
export const onRequest: RequestHandler = (event) => {
	event.cacheControl({
		staleWhileRevalidate: 60 * 60 * 24 * 7,
		// Max once every 5 seconds, revalidate on the server to get a fresh version of this page
		maxAge: 5,
	}); // disable caching

	const session: Session | null = event.sharedMap.get("session");
	if (!session || new Date(session.expires) < new Date() || session.error) {
		throw event.redirect(302, "/auth");
	}
};

export default component$(() => {
	const useQparam = useQueryParamsLoader();
	return (
		<>
			<Toolbar lang={useQparam.value.lang} />
			<div class="animate-fadeIn container mx-auto px-4 pt-16">
				<Slot />
			</div>
		</>
	);
});
