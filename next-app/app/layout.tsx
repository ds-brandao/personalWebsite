import type { Metadata } from "next";
import { clashDisplay, generalSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Brandao",
  description: "Software Engineer | Backend Developer | AI Technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${generalSans.variable}`}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
