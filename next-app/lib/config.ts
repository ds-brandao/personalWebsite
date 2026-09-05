import type { Config } from "@/types";
import configJson from "@/public/config/config.json";

/** Bundled configuration; reading it never needs I/O. */
export function getConfig(): Config {
  return configJson;
}
