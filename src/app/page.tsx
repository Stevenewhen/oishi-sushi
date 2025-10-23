// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import "./globals.css";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PHONE = "(337) 262-0106";
const TEL = "tel:+13372620106";
const ADDRESS = "924 Kaliste Saloom Rd, Lafayette, LA 70508";
const PLACE_ID = "ChIJi8UWUQadJIYR-3Oul30V0Sc";

// Only keep Directions since that's the one that works reliably
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  ADDRESS
)}`;

const HOURS: { day: string; time: string }[] = [
  { day: "Mon", time: "11:00 AM – 1:30 PM, 5:00 PM – 8:00 PM" },
  { day: "Tue", time: "11:00 AM – 1:30 PM, 5:00 PM – 8:00 PM" },
  { day: "Wed", time: "11:00 AM – 1:30 PM, 5:00 PM – 8:00 PM" },
  { day: "Thu", time: "11:00 AM – 1:30 PM, 5:00 PM – 8:00 PM" },
  { day: "Fri", time: "11:00 AM – 1:30 PM, 5:00 PM – 8:00 PM" },
  { day: "Sat", time: "5:00 PM – 8:00 PM" },
  { day: "Sun", time: "Closed" },
];

export default function Home() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "short" });

  const dishes = [
    { src: "/img/sushi-dinner-combo.png", name: "Sushi Dinner Combo" },
    { src: "/img/elizabeth-roll.png", name: "Elizabeth Roll" },
    { src: "/img/scott-roll.png", name: "Scott Roll" },
    { src: "/img/katherine-roll.png", name: "Katherine Roll" },
    { src: "/img/shannon-roll.png", name: "Shannon Roll" },
    { src: "/img/bobby-roll.png", name: "Bobby Roll" },
  ];

  return (
    <>
      <main className="min-h-dvh">
        {/* Hero Section (background is now global via <SiteBackground />) */}
        <section className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-18 lg:py-22">
            <div className="flex flex-col items-center text-center gap-5">
              {/* Logo */}
              <div className="text-center leading-tight">
                <div className="flex items-end justify-center gap-2 flex-nowrap">
                  <div className="hero-glow">
                    <Image
                      src="/img/oishi-logo.png"
                      alt="Oishi Sushi"
                      width={320}
                      height={96}
                      className="h-16 w-auto sm:h-24 mx-auto"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a href={TEL} className="btn btn--lg btn--primary">
                  Call {PHONE}
                </a>
                <Link href="/menu" className="btn btn--lg btn--secondary">
                  View Menu
                </Link>
                {/* Removed "Open in Maps" — keep a single Directions button */}
                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--lg btn--ghost"
                >
                  Directions
                </a>
              </div>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
                {[
                  { href: "/menu#appetizers", label: "🥟 Appetizers" },
                  { href: "/menu#sushi-rolls", label: "🍣 Sushi Rolls" },
                  { href: "/menu#sashimi", label: "🍱 Sashimi" },
                  { href: "/menu#combination-dinners", label: "🍱 Combination Dinners" },
                ].map((c) => (
                  <Link key={c.href} href={c.href} className="chip">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Hours */}
            <div className="card accent-top">
              <h2 className="card-title">Hours</h2>
              <ul className="text-sm divide-y divide-white/10">
                {HOURS.map((h) => {
                  const isToday = h.day.startsWith(today);
                  return (
                    <li key={h.day} className="flex items-center justify-between py-1.5">
                      <span className={isToday ? "font-semibold" : "opacity-80"}>{h.day}</span>
                      <span
                        className={`tabular-nums ${
                          isToday ? "px-2 py-0.5 rounded bg-red-500/10" : ""
                        }`}
                      >
                        {h.time}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Location */}
            <div className="card accent-top">
              <h2 className="card-title">Location</h2>
              <p className="text-sm opacity-90">{ADDRESS}</p>

              <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                <div className="relative aspect-[16/9] bg-white/5">
                  <iframe
                    title="Oishi Sushi map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      ADDRESS
                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {/* Replace the "Open in Maps" button with Directions */}
                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                >
                  Directions
                </a>
                <Link href="/menu" className="btn btn--ghost">
                  See Menu
                </Link>
              </div>
            </div>

            {/* Ordering */}
            <div className="card accent-top">
              <h2 className="card-title">Ordering</h2>
              <ul className="text-sm space-y-2">
                <li>
                  • <strong>Takeout only</strong>
                </li>
                <li>
                  • <strong>No dine-in seating</strong>
                </li>
                <li>
                  • <strong>No delivery</strong> (DoorDash/UberEats not available)
                </li>
                <li>
                  • Please call ahead:{" "}
                  <a href={TEL} className="underline">
                    {PHONE}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Popular Dishes Carousel */}
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="card-title mb-4">Popular Dishes</h2>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="rounded-2xl"
          >
            {dishes.map((it) => (
              <SwiperSlide key={it.name}>
                <figure className="rounded-2xl overflow-hidden border border-white/15 hover:border-red-600/40 hover:shadow-lg hover:shadow-red-900/20 transition">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={it.src}
                      alt={it.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none" />
                  </div>
                  <figcaption className="px-4 py-3 text-sm text-center">
                    {it.name}
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      </main>
    </>
  );
}
