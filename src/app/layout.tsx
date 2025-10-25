// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Pacifico } from "next/font/google";
import { Press_Start_2P } from "next/font/google"; // ← NEW
import SiteBackground from "@/components/SiteBackground";

const sushi = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-sushi" });
const mario = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-mario" }); // ← NEW

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
    images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: "Oishi Sushi" }],
  },
  twitter: { card: "summary_large_image", title: "Oishi Sushi", description: "Fresh nigiri, classic rolls, and chef specials—made to order.", images: ["/img/og.jpg"] },
  applicationName: "Oishi Sushi",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sushi.variable} ${mario.variable} h-full`}>  {/* ← add mario */}
      <body className="min-h-dvh">
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
