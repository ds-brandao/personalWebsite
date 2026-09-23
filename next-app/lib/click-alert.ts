import { SITE_URL } from "@/lib/site";

// One tracked-link click, as recorded by app/r/[slug]/route.ts.
export interface Click {
  slug: string;
  destination: string;
  time: string;
  ip: string;
  location: string;
  network: string;
  userAgent: string;
  referrer: string;
  likelyBot: boolean;
}

interface Detail {
  label: string;
  value: string;
  href?: string;
}

// Checked in order: Edge and Opera UAs also say Chrome, Chrome UAs also say
// Safari, and iOS UAs also say "Mac OS X".
const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\/|FxiOS/, "Firefox"],
  [/Chrome\/|CriOS/, "Chrome"],
  [/Safari\//, "Safari"],
];
const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X/, "macOS"],
  [/Windows/, "Windows"],
  [/Linux/, "Linux"],
];

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export async function sendClickAlert(click: Click): Promise<void> {
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
        subject: `${click.likelyBot ? "[bot?] " : ""}Link clicked: /r/${click.slug} by ${click.ip} (${click.location})`,
        html: renderHtml(click),
        text: renderText(click),
      }),
    });
    if (!res.ok) {
      console.error(`link alert failed: Resend ${res.status} ${await res.text()}`);
    }
  } catch (error) {
    console.error("link alert failed:", error);
  }
}

function details(click: Click): Detail[] {
  return [
    {
      label: "IP address",
      value: click.ip,
      href: click.ip === "unknown" ? undefined : `https://ipinfo.io/${encodeURIComponent(click.ip)}`,
    },
    { label: "Location", value: click.location },
    { label: "Network", value: click.network },
    { label: "Device", value: describeDevice(click.userAgent) },
    { label: "Time", value: click.time },
    { label: "Referrer", value: click.referrer },
  ];
}

function renderText(click: Click): string {
  return [
    `${SITE_URL}/r/${click.slug} was clicked`,
    `Goes to: ${click.destination}`,
    ...(click.likelyBot ? ["Likely a bot or link preview, going by the user agent."] : []),
    "",
    ...details(click).map(({ label, value }) => `${label}: ${value}`),
    "",
    `User agent: ${click.userAgent}`,
  ].join("\n");
}

// Table layout and inline styles: many mail clients ignore <style> and flexbox.
function renderHtml(click: Click): string {
  const rows = details(click)
    .map(({ label, value, href }) => {
      const cell = href
        ? `<a href="${esc(href)}" style="color:#0056b3;text-decoration:none">${esc(value)}</a>`
        : esc(value);
      return `<tr>
        <td style="padding:9px 0;border-top:1px solid #eef0f3;color:#6b7280;width:104px;vertical-align:top">${esc(label)}</td>
        <td style="padding:9px 0;border-top:1px solid #eef0f3;color:#111827;word-break:break-word">${cell}</td>
      </tr>`;
    })
    .join("");
  const botNotice = click.likelyBot
    ? `<p style="margin:14px 0 0;padding:9px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:13px;color:#9a3412">Likely a bot or link preview, going by the user agent.</p>`
    : "";

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px 12px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px">
    <tr><td style="padding:24px 24px 6px">
      <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280">Link clicked</p>
      <p style="margin:6px 0 0;font-size:22px;font-weight:600;color:#111827">/r/${esc(click.slug)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#4b5563">Goes to <a href="${esc(click.destination)}" style="color:#0056b3;text-decoration:none">${esc(displayUrl(click.destination))}</a></p>
      ${botNotice}
    </td></tr>
    <tr><td style="padding:12px 24px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.4">${rows}</table>
    </td></tr>
    <tr><td style="padding:4px 24px 22px;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all">${esc(click.userAgent)}</td></tr>
  </table>
</body>
</html>`;
}

// Rough "Browser on OS" for a readable summary; the raw user agent is still
// in the email.
function describeDevice(userAgent: string): string {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? "Unknown";
}

function displayUrl(url: string): string {
  return url.replace(/^(https?:\/\/|mailto:)/, "").replace(/\/$/, "");
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
