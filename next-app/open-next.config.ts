import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// KV-backed incremental cache so `next: { revalidate: 300 }` fetches
// (GitHub repos/commits) are actually cached instead of hitting the API
// on every request. (R2 is not enabled on this account; swap to
// r2-incremental-cache if that changes.)
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
