import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("detail route server data boundaries", () => {
  it("loads protected detail pages through route loaders instead of client resources", async () => {
    const routeFiles = [
      join(import.meta.dir, "movie/[id]/index.tsx"),
      join(import.meta.dir, "tv/[id]/index.tsx"),
      join(import.meta.dir, "person/[id]/index.tsx"),
    ];

    for (const routeFile of routeFiles) {
      const source = await readFile(routeFile, "utf8");

      expect(source).toContain("routeLoader$");
      expect(source).not.toContain("useResource$");
      expect(source).not.toContain("useQueryParamsLoader");
    }
  });

  it("renders IMDb data from loader results instead of a client-triggered fetch", async () => {
    const movieRouteSource = await readFile(
      join(import.meta.dir, "movie/[id]/index.tsx"),
      "utf8",
    );
    const tvRouteSource = await readFile(
      join(import.meta.dir, "tv/[id]/index.tsx"),
      "utf8",
    );
    const imdbComponentSource = await readFile(
      join(import.meta.dir, "../../components/imdb.tsx"),
      "utf8",
    );

    expect(movieRouteSource).toContain("getOptionalImdbRating(movie.imdb_id)");
    expect(tvRouteSource).toContain(
      "getOptionalImdbRating(tv.external_ids.imdb_id)",
    );
    expect(imdbComponentSource).not.toContain("useOnDocument");
    expect(imdbComponentSource).not.toContain("server$");
    expect(imdbComponentSource).not.toContain("getImdbRating");
  });

  it("writes recent activity from browser-only visible tasks after resume", async () => {
    const detailComponentFiles = [
      join(import.meta.dir, "../../components/media-details/movie-details.tsx"),
      join(import.meta.dir, "../../components/media-details/tv-details.tsx"),
      join(
        import.meta.dir,
        "../../components/person-details/person-details.tsx",
      ),
    ];

    for (const componentFile of detailComponentFiles) {
      const source = await readFile(componentFile, "utf8");

      expect(source).toContain("useVisibleTask$");
      expect(source).toContain("writeLastViewed({");
    }
  });
});
