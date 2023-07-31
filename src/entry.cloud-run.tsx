/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Google Cloud Run middleware when building for production.
 *
 * Learn more about the Cloud Run integration here:
 * - https://qwik.builder.io/docs/deployments/gcp-cloud-run/
 *
 */
import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import { createServer } from "node:http";
import render from "./entry.ssr";

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

/** The default headers used by helmet */
const DEFAULT_HEADERS = {
  // "Content-Security-Policy": [
  //   `default-src 'self' `,
  //   `base-uri 'self'`,
  //   `font-src 'self' https: data:`,
  //   `form-action 'self'`,
  //   `frame-ancestors 'self'`,
  //   `img-src 'self' data: https://image.tmdb.org https://via.placeholder.com`,
  //   `object-src 'none'`,
  //   `script-src 'self' data: https: 'unsafe-hashes' 'sha256-AGRY3xxNrg1lsVgcHu90qWAuT3Wdr69NywQJ+cZ0i4s=' 'sha256-aFV6ADPN1v6Y+lkTNBoitlm3LfSuZyb/iXmkhK6hELA=' 'sha256-Ce2y3UxMxDQ2YwcA9RP+kV6CR9Zk/zxDES+WO5tn2UY=' 'sha256-KspVIxP4OZdhXNAVISw+M/6qMZrXMlFKM8Jq3CI1C2M=' 'sha256-x/PeyayEC/WCpvkmYmxqMrvvTqukNU3ijXS2z236nI4=' 'sha256-lcHsB8GMEtdxMm8CwDKNTB8MJdU5NwZgsT8hXytteoY=' 'sha256-ATrDJO8AE/UC+8PKishyuzUDxRSthE1oHZqs1nMfeMY='`,
  //   `script-src-attr 'none'`,
  //   `style-src 'self' https: 'unsafe-inline'`,
  //   `upgrade-insecure-requests`,
  // ].join(";"),
  // "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Origin-Agent-Cluster": "?1",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "0",
};

// Create the Qwik City router
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
  static: {
    cacheControl: "public, max-age=31557600",
  },
  getOrigin(req) {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto
    const protocol = req.headers["x-forwarded-proto"] ?? "http";
    const host = req.headers["host"];
    return `${protocol}://${host}`;
  },
  getClientConn: (conn) => {
    const xForwardedFor = conn.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
      return {
        ip: xForwardedFor.split(",").shift()?.trim(),
      };
    } else if (Array.isArray(xForwardedFor)) {
      return {
        ip: xForwardedFor.shift()?.trim(),
      };
    }
    return {
      ip: undefined,
    };
  },
});

const server = createServer();

server.on("request", (req, res) => {
  for (const header of Object.entries(DEFAULT_HEADERS)) {
    res.setHeader(...header);
  }

  staticFile(req, res, () => {
    router(req, res, () => {
      notFound(req, res, () => {});
    });
  });
});

server.listen(process.env.PORT ?? 8080);
