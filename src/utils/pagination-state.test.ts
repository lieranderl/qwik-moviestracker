import { describe, expect, it } from "bun:test";
import {
  appendPage,
  beginNextPage,
  createPaginationState,
  failPage,
} from "./pagination-state";

describe("pagination state machine", () => {
  it("prevents overlapping requests and advances page results", () => {
    const initial = createPaginationState({
      items: [{ id: 1 }],
      mode: "page",
      pageSize: 1,
    });
    const loading = beginNextPage(initial);
    expect(loading.request).toEqual({ cursor: null, page: 2 });
    expect(beginNextPage(loading.state).request).toBeNull();

    const ready = appendPage(loading.state, { items: [{ id: 2 }] });
    expect(ready.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(ready.page).toBe(2);
    expect(ready.hasMore).toBe(true);
  });

  it("uses cursors, de-duplicates items, and stops at the end", () => {
    const initial = createPaginationState({
      cursor: "next-1",
      items: [{ id: 1 }],
      mode: "cursor",
      pageSize: 20,
    });
    expect(beginNextPage(initial).request).toEqual({
      cursor: "next-1",
      page: 2,
    });
    const complete = appendPage(initial, {
      cursor: null,
      items: [{ id: 1 }, { id: 2 }],
    });
    expect(complete.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(complete.hasMore).toBe(false);
  });

  it("keeps the next request retryable after failure", () => {
    const initial = createPaginationState({
      items: [{ id: 1 }],
      mode: "page",
      pageSize: 1,
    });
    const failed = failPage(beginNextPage(initial).state);
    expect(failed.status).toBe("error");
    expect(beginNextPage(failed).request?.page).toBe(2);
  });
});
