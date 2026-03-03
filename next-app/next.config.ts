import type { NextConfig } from "next";
import { execSync } from "child_process";

const commitHash = process.env.COMMIT_SHA
  ?? (() => {
    try {
      return execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return "unknown";
    }
  })();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitHash,
  },
};

export default nextConfig;
