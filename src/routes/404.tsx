import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { NotFoundPage } from "~/components/not-found-page";

export default component$(() => {
	const location = useLocation();
	const lang = location.url.searchParams.get("lang") || "en-US";
	return <NotFoundPage lang={lang} />;
});

export const head: DocumentHead = {
	title: "404 | Moviestracker",
	meta: [
		{
			name: "description",
			content: "Page not found",
		},
	],
};
