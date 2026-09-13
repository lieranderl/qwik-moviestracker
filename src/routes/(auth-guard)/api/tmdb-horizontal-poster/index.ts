import type { RequestHandler } from "@builder.io/qwik-city";
import { MediaType } from "~/services/models";
import { getHorizontalPosterPath } from "~/services/tmdb";

export const onGet: RequestHandler = async ({ json, query }) => {
  const id = Number.parseInt(query.get("id") ?? "", 10);
  const language = query.get("language")?.trim() || "en-US";
  const requestedType = query.get("type");
  const type =
    requestedType === MediaType.Movie
      ? MediaType.Movie
      : requestedType === MediaType.Tv
        ? MediaType.Tv
        : null;

  if (!Number.isSafeInteger(id) || id <= 0 || !type) {
    json(400, { backdropPath: null });
    return;
  }

  try {
    const artwork = await getHorizontalPosterPath({ id, language, type });
    json(200, { backdropPath: artwork.backdropPath });
  } catch (error) {
    console.error("Unable to load TMDB horizontal poster", error);
    json(503, { backdropPath: null });
  }
};
