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

const nextConfig: NextConfig = {
  // `standalone` is only for the Docker image (its Dockerfile copies
  // .next/standalone); the OpenNext Cloudflare build uses the default output.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitHash,
  },
};

export default nextConfig;
