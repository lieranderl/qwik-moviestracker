import { describe, expect, test } from "bun:test";
import { onGet } from "./index";

describe("health endpoint", () => {
  test("returns an uncached success response for candidate probes", async () => {
    const headers = new Headers();
    let response: Response | undefined;
    await onGet({
      headers,
      send(value: Response) {
        response = value;
      },
    } as never);
    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("ok");
    expect(headers.get("Cache-Control")).toBe("no-store");
  });
});
