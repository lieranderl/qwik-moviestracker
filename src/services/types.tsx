import { Timestamp } from "firebase/firestore";

export type TvMedia = {
    backdrop_path?: string | null;
    first_air_date?: string;
    genre_ids?: number[];
    id: number;
    media_type?: "tv";
    name?: string;
    origin_country?: string[];
    original_language?: string;
    original_name?: string;
    overview?: string[];
    popularity?: number;
    poster_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    created_by: CreatedBy[]
    seasons: Seasons[];
    in_production: boolean;
    last_air_date: string;
    next_episode_to_air?: Episode ;
    last_episode_to_air?: Episode;
    episode_run_time: number[];
    networks: Network[];
    number_of_seasons: number;
    number_of_episodes: number;
    character: string;
    job: string;
  };

  export type Network = {
    name: string;
    id: number;
    logo_path: string;
    origin_country: string;
  }

  export type Episode = {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
  }
  
  export type Seasons = {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
  }

  export type CreatedBy = {
      id: number
      credit_id: string
      name: string
      gender: number
      profile_path: string
    
  }
  
  export type MovieMedia = {
    adult?: boolean;
    backdrop_path?: string | null;
    genre_ids?: number[];
    id: number;
    media_type?: "movie";
    original_language?: string;
    original_title?: string;
    overview?: string;
    popularity?: number;
    poster_path?: string | null;
    release_date?: string;
    title?: string;
    video?: boolean;
    vote_average?: number;
    vote_count?: number;
    lastTimeFound?: number;
    LastTimeFound?: number | Timestamp;
    Torrents: Torrent[];
    character: string;
    job: string;
    Year: string;
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
  
  export type ProductionMedia = TvMedia | MovieMedia;
  
  export type PersonMedia = {
    profile_path?: string;
    adult?: boolean;
    id: number;
    known_for?: ProductionMedia[];
    name?: string;
    popularity?: number;
    media_type?: "person";
    job?: string;
    character?: string;

  };
  
  export type PersonMediaDetails = PersonMedia & {
    external_ids?: Record<string, string>;
    homepage?: string;
    biography?: string;
    known_for_department?: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    gender?: number;
    combined_credits?: {
      cast: ProductionMedia[];
      crew: ProductionMedia[];
    };
  };
  
  export type Genre = {
    id: number;
    name: string;
  };
  
  export type Production = {
    name?: string;
    id: number;
    logo_path?: string | null;
    origin_country?: string;
  };

  export type Country = {
    name: string;
    iso_3166_1: string;
  };
  
  export type Video = {
    iso_639_1?: string;
    iso_3166_1?: string;
    name?: string;
    key?: string;
    site?: string;
    size?: number;
    type?: string;
    official?: boolean;
    published_at?: string;
    id?: string;
  };
  
  export type Image = {
    aspect_ratio?: number;
    file_path?: string;
    height?: number;
    iso_639_1?: string | null;
    vote_average?: number;
    vote_count?: number;
    width?: number;
  };
  
  export type MediaDetails = {
    external_ids?: Record<string, string>;
    homepage?: string;
    status?: string;
    runtime?: number;
    genres?: Genre[];
    budget?: number;
    revenue?: number;
    imdb_id?: string;
    belongs_to_collection?: {id: number};
    production_companies?: Production[];
    production_countries?: Country[];
    tagline: string;
    credits?: {
      cast?: PersonMedia[];
      crew?: PersonMedia[];
    };
    images?: {
      backdrops?: Image[];
      logos?: Image[];
      posters?: Image[];
    };
    videos?: {
      results?: Video[];
    };
  };
  
  export type TvMediaDetails = TvMedia & MediaDetails;
  
  export type MovieMediaDetails = MovieMedia & MediaDetails;
  
  export type MediaType = "movie" | "tv" | "person";
  
  export type Collection<T> = {
    page?: number;
    results?: T[];
    total_pages?: number;
    total_results?: number;
    parts: T[];
    cast: T[];
    crew: T[];
  };