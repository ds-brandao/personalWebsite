import type { Metadata, Viewport } from "next";
import { schibstedGrotesk, hankenGrotesk, jetbrainsMono } from "./fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getConfig } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "Daniel Brandao is a security engineer working at the intersection of cybersecurity and applied AI — building self-healing networks, local LLM tooling, and automation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Daniel Brandao — Security Engineer × Applied AI",
    template: "%s — Daniel Brandao",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Daniel Brandao",
    title: "Daniel Brandao — Security Engineer × Applied AI",
    description: DESCRIPTION,
    images: [
      {
        url: "/images/portrait.jpg",
        width: 1179,
        height: 1199,
        alt: "Daniel Brandao",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Daniel Brandao — Security Engineer × Applied AI",
    description: DESCRIPTION,
    images: ["/images/portrait.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();

  // Entity data for name searches: tells Google who this site is about
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: config.personal.name,
        jobTitle: "Security Engineer",
        description: config.personal.lead,
        url: SITE_URL,
        image: `${SITE_URL}/images/portrait.jpg`,
        sameAs: [config.social.github.url, config.social.linkedin],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Seattle",
          addressRegion: "WA",
          addressCountry: "US",
        },
        knowsAbout: [
          "Cybersecurity",
          "Applied AI",
          "Network Security",
          "Automation",
          "Systems Integration",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: config.personal.name,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${schibstedGrotesk.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <script
          type="application/ld+json"
          // Values come from our own config.json; "<" is escaped per the
          // Next.js JSON-LD guidance as defense-in-depth.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
