import { component$ } from "@builder.io/qwik";
import { BsGenderFemale } from "@qwikest/icons/bootstrap";
import { BsGenderMale } from "@qwikest/icons/bootstrap";
import { BsGenderTrans } from "@qwikest/icons/bootstrap";
import { Image } from "@unpic/qwik";
import type { PersonMedia } from "~/services/models";
import { MediaType, type PersonFull } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import { paths } from "~/utils/paths";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { PersonBio } from "./person-bio";
import { PersonDate } from "./person-date";

interface MovieDetailsProps {
	person: PersonFull;
	perMovies: PersonMedia;
	perTv: PersonMedia;
	lang: string;
}

export const PersonDetails = component$(
	({ person, perMovies, perTv, lang }: MovieDetailsProps) => {
		return (
			<div class="pt-[64px] lg:mx-20 xl:mx-40">
				<section class="flex-wrap md:grid md:grid-flow-col md:grid-rows-1 md:gap-8">
					{person.profile_path && (
						<div class="flex w-full justify-center md:block">
							<Image
								width="300"
								height="450"
								src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
								class="rounded-xl"
								alt={person.name}
							/>
						</div>
					)}
					<div class="mt-4 md:mt-0">
						<section class="flex items-center text-2xl font-bold">
							{person.name}
							<div class="ml-2 font-extralight">
								{person.gender === 1 && <BsGenderFemale />}
								{person.gender === 2 && <BsGenderMale />}
								{person.gender === 3 && <BsGenderTrans />}
							</div>
						</section>

						<PersonDate
							place_of_birth={person.place_of_birth}
							birthday={person.birthday}
							deathday={person.deathday}
						/>
						<ExternalIds external_ids={person.external_ids} type={"person"} />
						<PersonBio biography={person.biography} />
					</div>
				</section>
				<section class="mt-8">
					{perMovies.cast.length > 0 && (
						<MediaCarousel
							title="Actor in Movies"
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{perMovies.cast.map((m) => (
								<div class="carousel-item" key={m.id}>
									<a href={paths.media(MediaType.Movie, m.id, lang)}>
										<MediaCard
											title={m.title ? m.title : ""}
											width={500}
											rating={m.vote_average ? m.vote_average : 0}
											year={(m.release_date && formatYear(m.release_date)) || 0}
											picfile={m.poster_path}
											isPerson={false}
											isHorizontal={false}
											charName={m.character}
										/>
									</a>
								</div>
							))}
						</MediaCarousel>
					)}

					{perTv.cast.length > 0 && (
						<MediaCarousel
							title="Actor in TV Shows"
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{perTv.cast.map((m) => (
								<div class="carousel-item" key={m.id}>
									<a href={paths.media(MediaType.Tv, m.id, lang)}>
										<MediaCard
											title={m.title ? m.title : ""}
											width={500}
											rating={m.vote_average ? m.vote_average : 0}
											year={
												(m.first_air_date && formatYear(m.first_air_date)) || 0
											}
											picfile={m.poster_path}
											isPerson={false}
											isHorizontal={false}
											charName={m.character}
										/>
									</a>
								</div>
							))}
						</MediaCarousel>
					)}

					{perMovies.crew.length > 0 && (
						<MediaCarousel
							title="Production Movies"
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{perMovies.crew.map((m) => (
								<div class="carousel-item" key={m.id}>
									<a href={paths.media(MediaType.Movie, m.id, lang)}>
										<MediaCard
											title={m.title ? m.title : ""}
											width={500}
											rating={m.vote_average ? m.vote_average : 0}
											year={
												(m.first_air_date && formatYear(m.first_air_date)) || 0
											}
											picfile={m.poster_path}
											isPerson={false}
											isHorizontal={false}
											charName={m.job}
										/>
									</a>
								</div>
							))}
						</MediaCarousel>
					)}

					{perTv.crew.length > 0 && (
						<MediaCarousel
							title="Production TV Shows"
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{perTv.crew.map((m) => (
								<div class="carousel-item" key={m.id}>
									<a href={paths.media(MediaType.Tv, m.id, lang)}>
										<MediaCard
											title={m.title ? m.title : ""}
											width={500}
											rating={m.vote_average ? m.vote_average : 0}
											year={
												(m.first_air_date && formatYear(m.first_air_date)) || 0
											}
											picfile={m.poster_path}
											isPerson={false}
											isHorizontal={false}
											charName={m.job}
										/>
									</a>
								</div>
							))}
						</MediaCarousel>
					)}
				</section>
			</div>
		);
	},
);
