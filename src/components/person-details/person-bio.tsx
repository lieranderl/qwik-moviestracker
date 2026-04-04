import { component$, useSignal } from "@builder.io/qwik";
import { langText } from "~/utils/languages";

export type PersonBioProps = {
	biography?: string;
	lang: string;
};
export const PersonBio = component$<PersonBioProps>(({ biography, lang }) => {
	const isShowBio = useSignal(false);
	const previewSize = 420;

	if (!biography) {
		return (
			<p class="text-base-content/70 text-sm">
				{langText(lang, "No biography available.", "Биография отсутствует.")}
			</p>
		);
	}

	if (biography.length < 300) {
		return <p class="leading-relaxed">{biography}</p>;
	}

	return (
		<div class="space-y-3">
			<p class="leading-relaxed">
				{isShowBio.value
					? biography
					: `${biography.substring(0, previewSize)}...`}
			</p>
			<button
				type="button"
				class="btn btn-ghost btn-sm px-0 normal-case"
				onClick$={() => {
					isShowBio.value = !isShowBio.value;
				}}
			>
				{isShowBio.value
					? langText(lang, "Read less", "Свернуть")
					: langText(lang, "Read more", "Читать далее")}
			</button>
		</div>
	);
});
