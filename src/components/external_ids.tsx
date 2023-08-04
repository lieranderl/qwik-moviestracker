import { component$ } from "@builder.io/qwik";
import { SiFacebook, SiInstagram, SiTwitter, SiTiktok, SiYoutube, SiImdb, SiWikipedia } from "@qwikest/icons/simpleicons";

type ExternalIdsProps = {
    external_ids?: Record<string, string>;
    type: "movie" | "tv" | "person";
}


export const ExternalIds = component$(({external_ids, type}: ExternalIdsProps) => {
  return (
    <>
      {external_ids && (
        <div class="flex space-x-2 my-4">
          {external_ids.facebook_id && (
            <a
              href={`https://facebook.com/${external_ids.facebook_id}`}
              target="_blank"
            >
              <SiFacebook class="w-6 h-6  " />
            </a>
          )}
          {external_ids.instagram_id && (
            <a
              href={`https://instagram.com/${external_ids.instagram_id}`}
              target="_blank"
            >
              <SiInstagram class="w-6 h-6" />
            </a>
          )}
          {external_ids.twitter_id && (
            <a
              href={`https://twitter.com/${external_ids.twitter_id}`}
              target="_blank"
            >
              <SiTwitter class="w-6 h-6" />
            </a>
          )}
          {external_ids.tiktok_id && (
            <a
              href={`https://tiktok.com/@${external_ids.tiktok_id}`}
              target="_blank"
            >
              <SiTiktok class="w-6 h-6 " />
            </a>
          )}
          {external_ids.youtube_id && (
            <a
              href={`https://youtube.com/${external_ids.youtube_id}`}
              target="_blank"
            >
              <SiYoutube class="w-6 h-6 " />
            </a>
          )}
          {external_ids.imdb_id && (
            <a
              href={type==="person" ? `https://imdb.com/name/${external_ids.imdb_id}` : `https://imdb.com/title/${external_ids.imdb_id}`}
              target="_blank"
            >
              <SiImdb class="w-6 h-6 " />
            </a>
          )}
          {external_ids.wikidata_id && (
            <a
              href={`https://www.wikidata.org/wiki/${external_ids.wikidata_id}`}
              target="_blank"
            >
              <SiWikipedia class="w-6 h-6 " />
            </a>
          )}
        </div>
      )}
    </>
  );
});
