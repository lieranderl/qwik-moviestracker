import { component$ } from "@builder.io/qwik";
import type {
	Network,
	ProductionCompany,
	ProductionCountry,
} from "~/services/models";
import { formatDate, formatLanguage } from "~/utils/fomat";
import {
	langCountries,
	langLanguages,
	langNetworks,
	langRelease,
} from "~/utils/languages";

export type MediaInfoProps = {
	release_date?: string;
	production_countries?: ProductionCountry[];
	original_language?: string;
	production_companies?: ProductionCompany[];
	lang: string;
	networks?: Network[];
};
export const MediaInfo = component$<MediaInfoProps>(
	({
		release_date,
		production_countries,
		production_companies,
		original_language,
		lang,
		networks
	}) => {
		return (
			<>

				<section class="grid grid-cols-1 gap-2 text-sm my-2">
					{release_date && (
						<div class="flex items-center gap-2">
							<span class="font-bold opacity-70">{langRelease(lang)}:</span>
							<span>{formatDate(release_date, lang)}</span>
						</div>
					)}

					{production_countries && (
						<div class="col-span-full flex flex-wrap items-center gap-2">
							<span class="font-bold opacity-70">{langCountries(lang)}:</span>
							{production_countries.map((c) => (
								<span key={c.iso_3166_1} class="badge badge-ghost badge-sm">
									{c.name}
								</span>
							))}
						</div>
					)}

					{original_language && (
						<div class="flex items-center gap-2">
							<span class="font-bold opacity-70">{langLanguages(lang)}:</span>
							<span class="uppercase text-sm">{formatLanguage(original_language)}</span>
						</div>
					)}

					{/* Networks */}
					{networks && networks.length > 0 && (
						<div class="flex items-center gap-2 ">
							<span class="font-bold opacity-70 text-sm">{langNetworks(lang)}:</span>
							<span class="font-bold text-sm">
								{networks.map((n) => n.name).join(", ")}
							</span>
						</div>
					)}


				</section>

				<section class="my-4">
					{production_companies && (
						<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs opacity-60">
							{production_companies.map((c) => (
								<span key={c.id}>{c.name}</span>
							))}
						</div>
					)}
				</section>
			</>
		);
	},
);
