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
  type: "movie" | "tv" | "person";
};

export const ExternalIds = component$(
  ({ external_ids, type }: ExternalIdsProps) => {
    return (
      <>
        {external_ids && (
          <div class="my-6 flex space-x-2 text-xl">
            {external_ids.facebook_id && (
              <a
                href={`https://facebook.com/${external_ids.facebook_id}`}
                target="_blank"
              >
                <SiFacebook />
              </a>
            )}
            {external_ids.instagram_id && (
              <a
                href={`https://instagram.com/${external_ids.instagram_id}`}
                target="_blank"
              >
                <SiInstagram />
              </a>
            )}
            {external_ids.twitter_id && (
              <a
                href={`https://twitter.com/${external_ids.twitter_id}`}
                target="_blank"
              >
                <SiX />
              </a>
            )}
            {external_ids.tiktok_id && (
              <a
                href={`https://tiktok.com/@${external_ids.tiktok_id}`}
                target="_blank"
              >
                <SiTiktok />
              </a>
            )}

            {external_ids.youtube_id && (
              <a
                href={`https://youtube.com/${external_ids.youtube_id}`}
                target="_blank"
              >
                <SiYoutube />
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
              >
                <SiImdb />
              </a>
            )}
            {external_ids.wikidata_id && (
              <a
                href={`https://www.wikidata.org/wiki/${external_ids.wikidata_id}`}
                target="_blank"
              >
                <SiWikidata />
              </a>
            )}
          </div>
        )}
      </>
    );
  },
);
