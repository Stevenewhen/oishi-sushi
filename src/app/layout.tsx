// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Pacifico, Press_Start_2P } from "next/font/google";
import SiteBackground from "@/components/SiteBackground";

// Keep just the weights you actually use
const sushi = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sushi",
});

// Mario font is still defined, but we won't attach it to <html>
// so it won't be treated as first-paint critical.
const mario = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mario",
});

export const metadata: Metadata = {
  title: { default: "Oishi Sushi", template: "%s — Oishi Sushi" },
  description: "Fresh nigiri, classic rolls, and chef specials—made to order.",
  metadataBase: new URL("https://oishi-sushi.com"),
  openGraph: {
    type: "website",
    url: "https://oishi-sushi.com/",
    siteName: "Oishi Sushi",
    title: "Oishi Sushi",
    description: "Fresh nigiri, classic rolls, and chef specials—made to order.",
    images: [
      {
        url: "/img/og.jpg",
        width: 1200,
        height: 630,
        alt: "Oishi Sushi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oishi Sushi",
    description: "Fresh nigiri, classic rolls, and chef specials—made to order.",
    images: ["/img/og.jpg"],
  },
  applicationName: "Oishi Sushi",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sushi.variable} h-full`}
    >
      <body className={`min-h-dvh ${mario.variable}`}>
        {/* mario.variable here means:
           - Mario font is available on the page
           - You can use it in CSS like `font-family: var(--font-mario);`
           - BUT it's not declared critical for initial paint */}
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
