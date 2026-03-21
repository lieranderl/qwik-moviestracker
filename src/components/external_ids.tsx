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
					<div class="my-2 flex flex-wrap gap-2 text-xl">
						{external_ids.facebook_id && (
							<a
								href={`https://facebook.com/${external_ids.facebook_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open Facebook profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
							>
								<SiFacebook class="h-6 w-6" />
							</a>
						)}
						{external_ids.instagram_id && (
							<a
								href={`https://instagram.com/${external_ids.instagram_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open Instagram profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
							>
								<SiInstagram class="h-6 w-6" />
							</a>
						)}
						{external_ids.twitter_id && (
							<a
								href={`https://twitter.com/${external_ids.twitter_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open X profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
							>
								<SiX class="h-6 w-6" />
							</a>
						)}
						{external_ids.tiktok_id && (
							<a
								href={`https://tiktok.com/@${external_ids.tiktok_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open TikTok profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
							>
								<SiTiktok class="h-6 w-6" />
							</a>
						)}

						{external_ids.youtube_id && (
							<a
								href={`https://youtube.com/${external_ids.youtube_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open YouTube profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
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
								aria-label="Open IMDb profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
							>
								<SiImdb class="h-6 w-6" />
							</a>
						)}
						{external_ids.wikidata_id && (
							<a
								href={`https://www.wikidata.org/wiki/${external_ids.wikidata_id}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Open Wikidata profile"
								class="inline-flex h-10 w-10 items-center justify-center text-base-content/80 no-underline transition-none hover:bg-transparent hover:text-current active:bg-transparent focus:outline-none"
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
