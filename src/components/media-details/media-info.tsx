import { component$ } from "@builder.io/qwik";
import type {
	Network,
	ProductionCompany,
	ProductionCountry,
} from "~/services/models";
import { formatDate, formatLanguage } from "~/utils/format";
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
		networks,
	}) => {
		return (
			<section class="card border-base-200 bg-base-100/95 border shadow-sm">
				<div class="card-body">
					<h3 class="card-title text-base-content/80 text-lg">
						Production Details
					</h3>
					<section class="my-1 grid grid-cols-1 gap-3 text-sm">
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
									<span key={c.iso_3166_1} class="badge badge-outline badge-sm">
										{c.name}
									</span>
								))}
							</div>
						)}

						{original_language && (
							<div class="flex items-center gap-2">
								<span class="font-bold opacity-70">{langLanguages(lang)}:</span>
								<span class="text-sm uppercase">
									{formatLanguage(original_language)}
								</span>
							</div>
						)}

						{/* Networks */}
						{networks && networks.length > 0 && (
							<div class="flex items-center gap-2">
								<span class="text-sm font-bold opacity-70">
									{langNetworks(lang)}:
								</span>
								<span class="text-sm font-bold">
									{networks.map((n) => n.name).join(", ")}
								</span>
							</div>
						)}
					</section>

					<section class="my-2">
						{production_companies && (
							<div class="flex flex-wrap items-center gap-2 text-xs opacity-70">
								{production_companies.map((c) => (
									<span key={c.id} class="badge badge-outline badge-sm">
										{c.name}
									</span>
								))}
							</div>
						)}
					</section>
				</div>
			</section>
		);
	},
);
