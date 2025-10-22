// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { Pacifico } from "next/font/google"; // font for “Sushi”

const sushi = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sushi",
});

export const metadata: Metadata = {
  title: "Oishi Sushi — Lafayette, LA",
  description: "Fresh nigiri, classic rolls, and chef specials—made to order.",
  icons: {
    icon: [
      { url: "/favicon-20251022.ico", rel: "icon", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

const PHONE = "(337) 262-0106";
const TEL = "tel:+13372620106";
const ADDRESS = "924 Kaliste Saloom Rd, Lafayette, LA 70508";
const PLACE_ID = "ChIJi8UWUQadJIYR-3Oul30V0Sc";

const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS
)}`;
const MAPS_PLACE_URL = PLACE_ID
  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(
      PLACE_ID
    )}`
  : "";
const MAPS_URL = MAPS_PLACE_URL || MAPS_SEARCH_URL;

function NavLogo() {
  return (
    <div className="flex items-end leading-none select-none shrink-0">
      <Image
        src="/img/oishi-logo.png"
        alt="Oishi"
        width={128}
        height={32}
        className="h-7 w-auto sm:h-8 shrink-0"
        priority
      />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={[
          "min-h-dvh bg-waves text-white antialiased",
          sushi.variable,
        ].join(" ")}
      >
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-2">
            <Link href="/" aria-label="Oishi Sushi home" className="inline-flex">
              <NavLogo />
            </Link>

            <div className="flex items-center gap-2">
              <nav className="hidden sm:flex items-center gap-4 text-sm min-w-0">
                <Link href="/menu" className="link-nav">
                  Menu
                </Link>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-nav"
                >
                  Directions
                </a>
              </nav>
              <a href={TEL} className="btn btn--sm btn--primary">
                Call {PHONE}
              </a>
            </div>
          </div>
        </header>

        {children}

        <footer className="mt-12 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm opacity-80">
            © {new Date().getFullYear()} Oishi Sushi, Lafayette, LA
          </div>
        </footer>
      </body>
    </html>
  );
}
