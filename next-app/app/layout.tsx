import type { Metadata, Viewport } from "next";
import { fraunces, plusJakartaSans } from "./fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getConfig } from "@/lib/data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: config.site.title,
    description: config.site.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
