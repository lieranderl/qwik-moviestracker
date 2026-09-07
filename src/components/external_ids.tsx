import { message } from "~/utils/i18n";
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
            facebook: message(lang, "ui.openFacebookProfile"),
            instagram: message(lang, "ui.openInstagramProfile"),
            x: message(lang, "ui.openXProfile"),
            tiktok: message(lang, "ui.openTiktokProfile"),
            youtube: message(lang, "ui.openYoutubeProfile"),
            imdb: message(lang, "ui.openImdbProfile"),
            wikidata: message(lang, "ui.openWikidataProfile"),
          }
        : {
            facebook: message(lang, "ui.openFacebookPage"),
            instagram: message(lang, "ui.openInstagramPage"),
            x: message(lang, "ui.openXPage"),
            tiktok: message(lang, "ui.openTiktokPage"),
            youtube: message(lang, "ui.openYoutubePage"),
            imdb: message(lang, "ui.openImdbPage"),
            wikidata: message(lang, "ui.openWikidataPage"),
          };

    const iconClass =
      "btn btn-circle btn-ghost min-h-11 w-11 border border-transparent text-base-content/80 shadow-none hover:border-base-300 hover:bg-base-200/80 hover:text-base-content sm:btn-md";

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
