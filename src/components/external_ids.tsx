import { component$ } from "@builder.io/qwik";
import {
  SiFacebook,
  SiImdb,
  SiInstagram,
  SiTiktok,
  SiWikidata,
  SiX,
  SiYoutube,
} from "@qwikest/icons/simpleicons";
import type { ExternalIDS } from "~/services/models";
import { langText } from "~/utils/languages";

type ExternalIdsProps = {
  external_ids?: ExternalIDS;
  lang: string;
  type: "movie" | "tv" | "person";
};

export const ExternalIds = component$(
  ({ external_ids, lang, type }: ExternalIdsProps) => {
    const labels =
      type === "person"
        ? {
            facebook: langText(lang, "Open Facebook profile", "Открыть профиль Facebook"),
            instagram: langText(lang, "Open Instagram profile", "Открыть профиль Instagram"),
            x: langText(lang, "Open X profile", "Открыть профиль X"),
            tiktok: langText(lang, "Open TikTok profile", "Открыть профиль TikTok"),
            youtube: langText(lang, "Open YouTube profile", "Открыть профиль YouTube"),
            imdb: langText(lang, "Open IMDb profile", "Открыть профиль IMDb"),
            wikidata: langText(lang, "Open Wikidata profile", "Открыть профиль Wikidata"),
          }
        : {
            facebook: langText(lang, "Open Facebook page", "Открыть страницу Facebook"),
            instagram: langText(lang, "Open Instagram page", "Открыть страницу Instagram"),
            x: langText(lang, "Open X page", "Открыть страницу X"),
            tiktok: langText(lang, "Open TikTok page", "Открыть страницу TikTok"),
            youtube: langText(lang, "Open YouTube page", "Открыть страницу YouTube"),
            imdb: langText(lang, "Open IMDb page", "Открыть страницу IMDb"),
            wikidata: langText(lang, "Open Wikidata page", "Открыть страницу Wikidata"),
          };

    const iconClass =
      "btn btn-circle btn-ghost btn-sm border border-transparent text-base-content/80 shadow-none hover:border-base-300 hover:bg-base-200/80 hover:text-base-content sm:btn-md";

    return (
      <>
        {external_ids && (
          <div class="my-2 flex flex-wrap gap-2 text-xl">
            {external_ids.facebook_id && (
              <a
                href={`https://facebook.com/${external_ids.facebook_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.facebook}
                class={iconClass}
              >
                <SiFacebook class="h-6 w-6" />
              </a>
            )}
            {external_ids.instagram_id && (
              <a
                href={`https://instagram.com/${external_ids.instagram_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.instagram}
                class={iconClass}
              >
                <SiInstagram class="h-6 w-6" />
              </a>
            )}
            {external_ids.twitter_id && (
              <a
                href={`https://twitter.com/${external_ids.twitter_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.x}
                class={iconClass}
              >
                <SiX class="h-6 w-6" />
              </a>
            )}
            {external_ids.tiktok_id && (
              <a
                href={`https://tiktok.com/@${external_ids.tiktok_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.tiktok}
                class={iconClass}
              >
                <SiTiktok class="h-6 w-6" />
              </a>
            )}

            {external_ids.youtube_id && (
              <a
                href={`https://youtube.com/${external_ids.youtube_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.youtube}
                class={iconClass}
              >
                <SiYoutube class="h-6 w-6" />
              </a>
            )}
            {external_ids.imdb_id && (
              <a
                href={
                  type === "person"
                    ? `https://imdb.com/name/${external_ids.imdb_id}`
                    : `https://imdb.com/title/${external_ids.imdb_id}`
                }
                target="_blank"
                rel="noreferrer"
                aria-label={labels.imdb}
                class={iconClass}
              >
                <SiImdb class="h-6 w-6" />
              </a>
            )}
            {external_ids.wikidata_id && (
              <a
                href={`https://www.wikidata.org/wiki/${external_ids.wikidata_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.wikidata}
                class={iconClass}
              >
                <SiWikidata class="h-6 w-6" />
              </a>
            )}
          </div>
        )}
      </>
    );
  },
);
