export type PaginationMode = "cursor" | "page";
export type PaginationStatus = "idle" | "loading" | "error";

export type PaginationState<T extends { id: number | string }> = {
  cursor: string | null;
  hasMore: boolean;
  items: T[];
  mode: PaginationMode;
  page: number;
  pageSize: number;
  status: PaginationStatus;
};

export const createPaginationState = <T extends { id: number | string }>({
  cursor = null,
  items,
  mode,
  pageSize,
}: {
  cursor?: string | null;
  items: T[];
  mode: PaginationMode;
  pageSize: number;
}): PaginationState<T> => ({
  cursor,
  hasMore: mode === "cursor" ? cursor !== null : items.length >= pageSize,
  items,
  mode,
  page: 1,
  pageSize,
  status: "idle",
});

export const beginNextPage = <T extends { id: number | string }>(
  state: PaginationState<T>,
): {
  state: PaginationState<T>;
  request: { cursor: string | null; page: number } | null;
} => {
  if (state.status === "loading" || !state.hasMore) {
    return { state, request: null };
  }
  return {
    state: { ...state, status: "loading" },
    request: { cursor: state.cursor, page: state.page + 1 },
  };
};

export const appendPage = <T extends { id: number | string }>(
  state: PaginationState<T>,
  result: { cursor?: string | null; items: T[] },
): PaginationState<T> => {
  const seen = new Set(state.items.map(({ id }) => String(id)));
  const unique = result.items.filter(({ id }) => !seen.has(String(id)));
  const cursor = result.cursor ?? null;
  return {
    ...state,
    cursor,
    hasMore:
      state.mode === "cursor"
        ? cursor !== null
        : result.items.length >= state.pageSize,
    items: [...state.items, ...unique],
    page: result.items.length > 0 ? state.page + 1 : state.page,
    status: "idle",
  };
};

export const failPage = <T extends { id: number | string }>(
  state: PaginationState<T>,
): PaginationState<T> => ({ ...state, status: "error" });
