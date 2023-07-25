import type { MediaType } from "~/services/types";


export const categoryToDb = (category: string) => {
    if (category === "updated") return "latesttorrentsmovies";
    if (category === "hdr10") return "hdr10movies";
    if (category === "dolbyvision") return "dvmovies";
    if (category === "trending") return "trending";
    return "latesttorrentsmovies";
};

export const categoryToTitle = (category: string) => {
    if (category === "updated") return "All Updated Movies";
    if (category === "hdr10") return "All HDR10 Movies";
    if (category === "dolbyvision") return "All DolbyVision Movies";
    if (category === "trending") return "All Trending Movies";
    return "All Updated Movies";
};

export const paths = {
//   genre: (mediaType: MediaType, id: number) => `/genre/${id}/${mediaType}`,
  index: "/",
  media: (mediaType: MediaType, id: number, lang: string) => `/${mediaType}/${id}?lang=${lang}`,
  category: (type: string, category: string, lang: string) => `/${type}/category/${category}?lang=${lang}`,
  moviePhotos: (id: number, lang: string) => `/movie/${id}/photos?lang=${lang}`,
  movieVideo: (id: number, lang: string) => `/movie/${id}/videos?lang=${lang}`,
  notFound: "/404",
  person: (id: number, lang: string) => `/person/${id}?lang=${lang}`,
  search:(lang: string) => `/search?lang=${lang}`,
};