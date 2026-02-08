import type { ImdbRating, Torrent } from "./models";

const baseCGURL = "https://moviestracker-gw-eu-w1-8vmmbwbl.ew.gateway.dev";
const fetchAPI = async <T = unknown>(
  path: string,
  search: Record<string, string> = {},
): Promise<T> => {
  const params = new URLSearchParams({
    ...search,
    key: process.env.GC_API_KEY || "",
  });
  const url = `${baseCGURL}/${path}?${params}`;
  const response = await fetch(url, {
    headers: {
      Origin: "https://moviestracker.net",
      Referer: "https://moviestracker.net",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Cloud API request failed (${response.status}) for ${path}`,
    );
  }

  return response.json() as T;
};

export const getImdbRating = (imdb_id: string) =>
  fetchAPI<ImdbRating>("getimdb", { imdb_id });

export type getTorrentsType = {
  name: string;
  year: number;
  isMovie: boolean;
};
export const getTorrents = ({ name, year, isMovie }: getTorrentsType) => {
  return fetchAPI<Torrent[]>("gettorrents", {
    MovieName: name,
    Year: year.toString(),
    isMovie: String(isMovie),
  });
};
