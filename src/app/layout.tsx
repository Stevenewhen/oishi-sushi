// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Pacifico } from "next/font/google";
import SiteBackground from "@/components/SiteBackground";

const sushi = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-sushi" });

export const metadata: Metadata = {
  title: "Oishi Sushi — Lafayette, LA",
  description: "Fresh nigiri, classic rolls, and chef specials—made to order.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sushi.variable} h-full`}>
      <body className="min-h-dvh">
        {/* Persistent site-wide background */}
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
