import type { Timestamp } from "firebase/firestore";

export type MovieShort = {
  adult?: boolean;
  backdrop_path?: string;
  genre_ids?: number[];
  id: number;
  media_type?: MediaType;
  original_language?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string;
  original_title?: string;
  release_date?: Date;
  title?: string;
  video?: boolean;
};

export type TvShort = {
  adult?: boolean;
  backdrop_path?: string;
  genre_ids?: number[];
  id: number;
  media_type?: MediaType;
  original_language?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string;
  name?: string;
  original_name?: string;
  first_air_date?: Date;
  origin_country?: string[];
};

export type MovieDetails = {
  adult?: boolean;
  backdrop_path?: string;
  belongs_to_collection?: BelongsToCollection;
  budget?: number;
  genres?: Genre[];
  homepage?: string;
  id: number;
  imdb_id?: string;
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  release_date?: Date;
  revenue?: number;
  runtime?: number;
  spoken_languages?: SpokenLanguage[];
  status?: string;
  tagline?: string;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
};

export type TvDetails = {
  adult?: boolean;
  backdrop_path?: string;
  created_by?: CreatedBy[];
  episode_run_time?: number[];
  first_air_date?: Date;
  genres?: Genre[];
  homepage?: string;
  id: number;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: Date;
  last_episode_to_air?: LastEpisodeToAir;
  name?: string;
  next_episode_to_air?: string;
  networks?: Network[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  original_language?: string;
  original_name?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  production_companies?: Network[];
  production_countries?: ProductionCountry[];
  seasons?: Season[];
  spoken_languages?: SpokenLanguage[];
  status?: string;
  tagline?: string;
  type?: string;
  vote_average?: number;
  vote_count?: number;
};

export type CreatedBy = {
  id?: number;
  credit_id?: string;
  name?: string;
  gender?: number;
  profile_path?: string;
};

export type Season = {
  air_date?: Date;
  episode_count?: number;
  id?: number;
  name?: string;
  overview?: string;
  poster_path?: string;
  season_number?: number;
  vote_average?: number;
};

export type LastEpisodeToAir = {
  id?: number;
  name?: string;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  air_date?: Date;
  episode_number?: number;
  episode_type?: string;
  production_code?: string;
  runtime?: number;
  season_number?: number;
  show_id?: number;
  still_path?: string;
};

export type Network = {
  id?: number;
  logo_path?: null | string;
  name?: string;
  origin_country?: string;
};

export type BelongsToCollection = {
  id?: number;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
};

export type Genre = {
  id?: number;
  name?: string;
};

export type ProductionCompany = {
  id?: number;
  logo_path?: null | string;
  name?: string;
  origin_country?: string;
};

export type ProductionCountry = {
  iso_3166_1?: string;
  name?: string;
};

export type SpokenLanguage = {
  english_name?: string;
  iso_639_1?: string;
  name?: string;
};

export type Collection = {
  id?: number;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  parts?: MovieDetails[];
};

export type MediaAppended = {
  videos?: Videos;
  images?: Images;
  external_ids?: ExternalIDS;
  credits?: Credits;
  similar?: Similar;
  recommendations?: Similar;
};

export type Videos = {
  id?: number;
  results?: VideoResult[];
};

export type VideoResult = {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  key?: string;
  site?: string;
  size?: number;
  type?: string;
  official?: boolean;
  published_at?: Date;
  id?: string;
};

export type Images = {
  backdrops?: ImagesDetails[];
  id?: number;
  logos?: ImagesDetails[];
  posters?: ImagesDetails[];
};

export type ImagesDetails = {
  aspect_ratio?: number;
  height?: number;
  iso_639_1?: null | string;
  file_path?: string;
  vote_average?: number;
  vote_count?: number;
  width?: number;
};

export type ExternalIDS = {
  id?: number;
  imdb_id?: string;
  wikidata_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
  tiktok_id?: string;
  youtube_id?: string;
};

export type Credits = {
  cast?: CastCrew[];
  crew?: CastCrew[];
};

export type CastCrew = {
  adult?: boolean;
  gender?: number;
  id?: number;
  known_for_department?: Department;
  name?: string;
  original_name?: string;
  popularity?: number;
  profile_path?: null | string;
  cast_id?: number;
  character?: string;
  credit_id?: string;
  order?: number;
  department?: Department;
  job?: string;
  mediaType?: MediaType;
  known_for?: MovieShort[] | TvShort[];
};

export enum Department {
  Acting = "Acting",
  Art = "Art",
  Camera = "Camera",
  CostumeMakeUp = "Costume & Make-Up",
  Crew = "Crew",
  Directing = "Directing",
  Editing = "Editing",
  Lighting = "Lighting",
  Production = "Production",
  Sound = "Sound",
  VisualEffects = "Visual Effects",
  Writing = "Writing",
}

export type Similar = {
  page?: number;
  results?: MovieShort[];
};

export enum MediaType {
  Movie = "movie",
  Tv = "tv",
  Person = "person",
}

export type PersonShort = {
  adult?: boolean;
  id: number;
  name?: string;
  original_name?: string;
  media_type?: string;
  popularity?: number;
  gender?: number;
  known_for_department?: string;
  profile_path?: string;
};

export type PersonDetails = {
  adult?: boolean;
  also_known_as?: string[];
  biography?: string;
  birthday?: Date;
  deathday?: Date;
  gender?: number;
  homepage?: string;
  id: number;
  imdb_id?: string;
  known_for_department?: string;
  name?: string;
  place_of_birth?: string;
  popularity?: number;
  profile_path?: string;
};

export type MovieFull = MovieDetails & MediaAppended;
export type TvFull = TvDetails & MediaAppended;
export type PersonFull = PersonDetails & MediaAppended;
export type MediaFull = MovieFull | TvFull | PersonFull;
export type MediaShort = MovieShort | TvShort | PersonShort;
export type MediaDetails = MovieDetails | TvDetails | PersonDetails;

export type MediaCollection = {
  page?: number;
  results?: MediaShort[];
  total_pages?: number;
  total_results?: number;
};

export type MovieFirestore = {
  Year: string;
  LastTimeFound?: number | Timestamp;
  lastTimeFound?: number;
};

export type Torrent = {
  Name: string;
  DetailsUrl: string;
  OriginalName: string;
  RussianName: string;
  Year: string;
  Size: number;
  Magnet: string;
  Date: string;
  K4: boolean;
  FHD: boolean;
  HDR: boolean;
  HDR10: boolean;
  HDR10plus: boolean;
  DV: boolean;
  Seeds: number;
  Leeches: number;
  Hash: string;
}

export type ImdbRating = {
  Id: string;
  Rating: string;
  Votes: string;
};