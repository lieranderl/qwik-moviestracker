import type { CacheControl } from "@builder.io/qwik-city/middleware/request-handler";

export const applyAuthenticatedCachePolicy = (
  cacheControl: (policy: CacheControl) => void,
) => {
  cacheControl({
    private: true,
    noStore: true,
  });
};
