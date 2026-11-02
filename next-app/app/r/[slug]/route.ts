import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendClickAlert, type Click } from "@/lib/click-alert";
import { LINKS } from "@/lib/links";

export const dynamic = "force-dynamic";

interface LinkRouteContext {
  params: Promise<{ slug: string }>;
}

// Subset of Cloudflare's request.cf we read; absent outside Workers. OpenNext
// types cf as CfProperties from @cloudflare/workers-types, which this project
// doesn't install, so it arrives untyped.
interface CfLocation {
  city?: string;
  region?: string;
  country?: string;
  asOrganization?: string;
}

// The Workers rate limiting binding declared in wrangler.jsonc.
interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

// Crawlers, link unfurlers and scripted clients. Flagged in the alert rather
// than dropped: user agents are easy to fake either way.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget|python|go-http|node-fetch|axios/i;

const RATE_LIMITED_HEADERS = {
  "Retry-After": "60",
  "Cache-Control": "no-store",
};

export async function GET(request: Request, { params }: LinkRouteContext) {
  if (await overRateLimit(request)) {
    return new Response("Too many requests", {
      status: 429,
      headers: RATE_LIMITED_HEADERS,
    });
  }
  const { slug } = await params;
  const destination = lookup(slug);
  if (!destination) return new Response("Not found", { status: 404 });

  const click = describeClick(request, { slug, destination });
  // Logged before emailing so Workers observability keeps a record even if
  // Resend is down or unconfigured.
  console.log(JSON.stringify({ event: "link_click", ...click }));
  runAfterResponse(sendClickAlert(click));
  return redirect(destination);
}

// Mail and chat link scanners often probe with HEAD; answer without an alert
// so only real visits send email.
export async function HEAD(request: Request, { params }: LinkRouteContext) {
  if (await overRateLimit(request)) {
    return new Response(null, { status: 429, headers: RATE_LIMITED_HEADERS });
  }
  const destination = lookup((await params).slug);
  return destination
    ? redirect(destination)
    : new Response(null, { status: 404 });
}

// Per-IP cap so nobody can walk slugs to map the link list or flood the
// inbox with click alerts. Counts are per Cloudflare location and
// approximate, which is enough for both.
async function overRateLimit(request: Request): Promise<boolean> {
  const ip = request.headers.get("cf-connecting-ip");
  const limiter = linkRateLimiter();
  if (!ip || !limiter) return false;
  const { success } = await limiter.limit({ key: ip });
  return !success;
}

function linkRateLimiter(): RateLimiter | undefined {
  try {
    // Cast: cloudflare-env.d.ts isn't generated (see lib/data.ts).
    return (getCloudflareContext().env as { LINK_RATE_LIMITER?: RateLimiter })
      .LINK_RATE_LIMITER;
  } catch {
    return undefined; // Not running on Workers (Docker / next start)
  }
}

function lookup(slug: string): string | undefined {
  // hasOwn: a plain LINKS[slug] would resolve /r/constructor to Object's.
  return Object.hasOwn(LINKS, slug) ? LINKS[slug] : undefined;
}

// 302 + no-store: a cached (301) redirect would skip this route on repeat
// clicks, so they'd go untracked.
function redirect(destination: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function describeClick(
  request: Request,
  { slug, destination }: Pick<Click, "slug" | "destination">
): Click {
  const cf = cloudflareLocation();
  const userAgent = request.headers.get("user-agent") ?? "";
  const country = cf?.country ?? request.headers.get("cf-ipcountry");
  return {
    slug,
    destination,
    time: new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }),
    // Cloudflare sets this to the connecting client's address and overwrites
    // any value a client sends, unlike X-Forwarded-For.
    ip: request.headers.get("cf-connecting-ip") ?? "unknown",
    location:
      [cf?.city, cf?.region, country].filter(Boolean).join(", ") || "unknown",
    network: cf?.asOrganization ?? "unknown",
    userAgent: userAgent || "none",
    referrer: request.headers.get("referer") ?? "none",
    likelyBot: !userAgent || BOT_PATTERN.test(userAgent),
  };
}

function cloudflareLocation(): CfLocation | undefined {
  try {
    return getCloudflareContext().cf;
  } catch {
    return undefined; // Not running on Workers (Docker / next start)
  }
}

// A Worker stops once the response is sent unless pending work is handed to
// waitUntil. Outside Workers the Node process stays up and the promise
// finishes on its own.
function runAfterResponse(task: Promise<void>) {
  try {
    getCloudflareContext().ctx.waitUntil(task);
  } catch {
    // Not running on Workers
  }
}
