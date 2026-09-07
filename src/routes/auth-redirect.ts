export const buildAuthRedirectPath = (lang: string | null): string =>
  lang ? `/auth/?lang=${encodeURIComponent(lang)}` : "/auth";
