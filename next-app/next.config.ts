import type { NextConfig } from "next";
import { execSync } from "child_process";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Provides Cloudflare bindings (ASSETS, KV) during `next dev`. Skipped in
// Docker builds: it spawns workerd, which can't run on musl/alpine.
if (!process.env.DOCKER_BUILD) {
  initOpenNextCloudflareForDev();
}

const commitHash = process.env.COMMIT_SHA
  ?? (() => {
    try {
      return execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return "unknown";
    }
  })();

const isDev = process.env.NODE_ENV !== "production";

// Same-origin CSP. 'unsafe-inline' is required for next-themes' FOUC
// script and Next.js inline styles. next/font self-hosts Google fonts;
// GitHub fetches are server-side; there is no analytics or other CDN.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `standalone` is only for the Docker image (its Dockerfile copies
  // .next/standalone); the OpenNext Cloudflare build uses the default output.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitHash,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // www is attached as a Worker custom domain (see wrangler.jsonc) so DNS
  // resolves; this 301 makes dbrandao.com the single canonical host.
  // Next does not interpolate `:path*` for `/`, so the catch-all used to
  // 301 the root to the literal URL https://dbrandao.com/:path*. Split:
  // `/` is explicit, other paths use `:path+` (one or more segments).
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "www.dbrandao.com" }],
        destination: "https://dbrandao.com/",
        statusCode: 301,
      },
      {
        source: "/:path+",
        has: [{ type: "host", value: "www.dbrandao.com" }],
        destination: "https://dbrandao.com/:path+",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
