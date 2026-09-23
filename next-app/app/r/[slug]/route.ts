import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LINKS } from "@/lib/links";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

interface LinkRouteContext {
  params: Promise<{ slug: string }>;
}

interface Click {
  slug: string;
  destination: string;
  time: string;
  location: string;
  network: string;
  userAgent: string;
  referrer: string;
  likelyBot: boolean;
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

// Crawlers, link unfurlers and scripted clients. Flagged in the alert rather
// than dropped: user agents are easy to fake either way.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget|python|go-http|node-fetch|axios/i;

export async function GET(request: Request, { params }: LinkRouteContext) {
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
export async function HEAD(_request: Request, { params }: LinkRouteContext) {
  const destination = lookup((await params).slug);
  return destination
    ? redirect(destination)
    : new Response(null, { status: 404 });
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
      dateStyle: "medium",
      timeStyle: "short",
    }),
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

async function sendClickAlert(click: Click): Promise<void> {
  const { RESEND_API_KEY, LINK_ALERT_TO, LINK_ALERT_FROM } = process.env;
  if (!RESEND_API_KEY || !LINK_ALERT_TO || !LINK_ALERT_FROM) {
    console.warn(
      "link alert skipped: set RESEND_API_KEY, LINK_ALERT_TO and LINK_ALERT_FROM"
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: LINK_ALERT_FROM,
        to: LINK_ALERT_TO,
        subject: `${click.likelyBot ? "[bot?] " : ""}Link clicked: /r/${click.slug} (${click.location})`,
        text: [
          `Link: ${SITE_URL}/r/${click.slug}`,
          `Destination: ${click.destination}`,
          `Time: ${click.time} (Pacific)`,
          `Location: ${click.location}`,
          `Network: ${click.network}`,
          `Browser: ${click.userAgent}`,
          `Referrer: ${click.referrer}`,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(`link alert failed: Resend ${res.status} ${await res.text()}`);
    }
  } catch (error) {
    console.error("link alert failed:", error);
  }
}
