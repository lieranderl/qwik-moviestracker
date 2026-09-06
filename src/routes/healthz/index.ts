import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ({ headers, send }) => {
  headers.set("Cache-Control", "no-store");
  send(new Response("ok", { status: 200 }));
};
