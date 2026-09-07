import * as v from "valibot";
import type { MediaType } from "./models";

export type HorizontalPosterRequest = {
  id: number | string;
  language: string;
  type: MediaType.Movie | MediaType.Tv;
};
type PosterFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

const responseSchema = v.object({
  filePath: v.nullable(v.pipe(v.string(), v.startsWith("/"))),
});

const requests = new Map<string, Promise<string | null>>();
const MAX_CLIENT_ENTRIES = 200;

export const clearHorizontalPosterRequestsForTests = () => requests.clear();

export const buildHorizontalPosterRequestUrl = ({
  id,
  language,
  type,
}: HorizontalPosterRequest) => {
  const search = new URLSearchParams({
    id: String(id),
    language,
    type,
  });
  return `/api/tmdb-horizontal-poster?${search.toString()}`;
};

export const parseHorizontalPosterResponse = (input: unknown) => {
  const result = v.safeParse(responseSchema, input);
  if (!result.success) throw new Error("Invalid horizontal poster response");
  return result.output.filePath;
};

export const loadHorizontalPosterPath = (
  request: HorizontalPosterRequest,
  fetcher: PosterFetcher = fetch,
) => {
  const url = buildHorizontalPosterRequestUrl(request);
  const existing = requests.get(url);
  if (existing) return existing;

  if (requests.size >= MAX_CLIENT_ENTRIES) {
    const oldest = requests.keys().next().value;
    if (oldest) requests.delete(oldest);
  }

  const pending = fetcher(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Horizontal poster is unavailable");
      return parseHorizontalPosterResponse(await response.json());
    })
    .catch((error) => {
      requests.delete(url);
      throw error;
    });
  requests.set(url, pending);
  return pending;
};
