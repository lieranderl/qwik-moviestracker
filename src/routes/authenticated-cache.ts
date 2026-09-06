type AuthenticatedCachePolicy = {
  public: false;
  maxAge: 0;
  sMaxAge: 0;
  staleWhileRevalidate: 0;
};

export const applyAuthenticatedCachePolicy = (
  cacheControl: (policy: AuthenticatedCachePolicy) => void,
) => {
  cacheControl({
    public: false,
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
  });
};
