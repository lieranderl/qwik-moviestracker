import { component$ } from "@builder.io/qwik";
import type {
  Genre,
  ProductionCompany,
  ProductionCountry,
} from "~/services/models";
import { formatDate, formatLanguage } from "~/utils/fomat";
import { langMinutes } from "~/utils/languages";

export type MediaInfoProps = {
  release_date?: string;
  geners?: Genre[];
  runtime?: number;
  production_countries?: ProductionCountry[];
  original_language?: string;
  production_companies?: ProductionCompany[];
  lang: string;
};
export const MediaInfo = component$<MediaInfoProps>(
  ({
    release_date,
    geners,
    runtime,
    production_countries,
    production_companies,
    original_language,
    lang,
  }) => {
    return (
      <>
        <section class="text-md">
          <ul class="flex flex-wrap items-center justify-start">
            <li>
              {release_date && (
                <div class="after:content-['\3164\2022\3164']">
                  {formatDate(release_date, lang)}{" "}
                </div>
              )}
            </li>
            <li>
              {geners && geners.length > 0 && (
                <div class="after:content-['\3164\2022\3164'] ">
                  {geners.map((g) => g.name).join(", ")}
                </div>
              )}
            </li>
            <li>
              {runtime && runtime! > 0 && (
                <div class="after:content-['\3164\2022\3164']">
                  {runtime} {langMinutes(lang)}
                </div>
              )}
            </li>
            <li>
              {production_countries && (
                <div class="after:content-['\3164\2022\3164']">
                  {production_countries.map((c) => c.name).join(", ")}
                </div>
              )}
            </li>

            <li>
              {original_language && (
                <div>{formatLanguage(original_language)}</div>
              )}
            </li>
          </ul>
        </section>
        <section class="text-md my-1">
          {production_companies && (
            <div>{production_companies.map((c) => c.name).join(", ")}</div>
          )}
        </section>
      </>
    );
  },
);
