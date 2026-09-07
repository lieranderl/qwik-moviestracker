import type { MovieShort, PersonShort, TvShort } from "./tmdb";
import { MediaType } from "./tmdb";

export type MovieCatalogAttributes = {
  year: string;
  lasttimefound?: Date;
  first_air_date?: string;
};

/** @deprecated Use MovieCatalogAttributes. */
export type MovieCatalogAttribs = MovieCatalogAttributes;

export type MovieCatalog = MovieShort & MovieCatalogAttributes;

export type MediaShort = MovieShort &
  TvShort &
  PersonShort &
  MovieCatalogAttributes;

export type MediaShortStrict<
  T extends MediaType.Movie | MediaType.Tv | MediaType.Person,
> = T extends MediaType.Movie
  ? MovieCatalog
  : T extends MediaType.Tv
    ? TvShort
    : PersonShort;
