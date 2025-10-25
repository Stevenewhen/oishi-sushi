"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Cat = { slug: string; title: string };

// tiny conditional class helper
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function CategoryNav({ cats }: { cats: Cat[] }) {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // --- desktop auto-fit refs/state ---
  const desktopWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopRowRef = useRef<HTMLUListElement | null>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number>();

  // Observe section headings to mark active pill as you scroll
  useEffect(() => {
    const sections = cats
      .map((c) => document.getElementById(c.slug))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.id) setActive(top.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [cats]);

  const options = useMemo(() => cats.map((c) => ({ ...c })), [cats]);

  const goTo = (slug: string) => {
    if (!slug) return;
    const el = document.getElementById(slug);
    if (el) {
      window.history.replaceState(null, "", `#${slug}`);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(slug);
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  // Fit chips on ONE LINE by scaling the row if needed
  useEffect(() => {
    const wrap = desktopWrapRef.current;
    const row = desktopRowRef.current;
    if (!wrap || !row) return;

    const fit = () => {
      const avail = wrap.clientWidth;
      const needed = row.scrollWidth;
      if (!avail || !needed) return;

      const raw = Math.min(1, (avail - 4) / needed);
      const next = Math.max(raw, 0.84);

      setScale(next);
      const h = row.getBoundingClientRect().height;
      setScaledHeight(h * next);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    ro.observe(row);
    window.addEventListener("resize", fit);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [cats.length]);

  return (
    <nav
      className="sticky top-14 z-30 -mx-4 px-4 py-2
                 bg-background/70 backdrop-blur border-b border-white/10"
      aria-label="Menu categories"
    >
      {/* Mobile: red dropdown (button + popover) */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            ref={btnRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cx(
              "w-full rounded-xl px-4 pr-11 py-3 text-base leading-6 text-white",
              "border border-transparent",
              // Sushi red gradient + glow
              "bg-gradient-to-b from-[#E64530] to-[#C63C27] shadow-[0_0_15px_rgba(230,69,48,0.30)]",
              "hover:from-[#FF6240] hover:to-[#E64530] hover:shadow-[0_0_22px_rgba(255,98,64,0.40)]",
              "active:from-[#E64530] active:to-[#B53521]",
              // Focus ring in red
              "focus:outline-none focus:ring-2 focus:ring-red-500/60"
            )}
          >
            {active ? (cats.find((c) => c.slug === active)?.title ?? "…") : "Jump to…"}
            <svg
              className="pointer-events-none absolute right-7 top-[18px] h-5 w-5 opacity-95"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.2l3.71-2.97a.75.75 0 1 1 .94 1.16l-4.24 3.4a.75.75 0 0 1-.94 0l-4.24-3.4a.75.75 0 0 1 .02-1.16z" />
            </svg>
          </button>

          {open && (
            <div
              ref={listRef}
              role="listbox"
              tabIndex={-1}
              className="absolute left-0 right-0 mt-2 rounded-xl border border-red-500/30
                         bg-zinc-900/95 backdrop-blur shadow-xl overflow-hidden"
            >
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {options.map((opt) => {
                  const isActive = active === opt.slug;
                  return (
                    <button
                      key={opt.slug}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => goTo(opt.slug)}
                      className={cx(
                        "w-full text-left px-4 py-3 text-[15px] leading-6 text-white transition-colors",
                        "hover:bg-red-500/10 focus:bg-red-500/15 focus:outline-none",
                        isActive ? "bg-red-500/15 border-l-2 border-red-500/70" : "bg-transparent"
                      )}
                    >
                      {opt.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {active && (
          <p className="mt-1.5 text-xs text-white/80">
            Viewing:{" "}
            <span className="font-semibold text-white">
              {cats.find((c) => c.slug === active)?.title}
            </span>
          </p>
        )}
      </div>

      {/* Desktop: single-line, auto-scaling chips (no horizontal scroll) */}
      <div
        ref={desktopWrapRef}
        className="hidden sm:block mt-2 sm:mt-0 overflow-hidden"
        style={scaledHeight ? { height: `${scaledHeight}px` } : undefined}
      >
        <ul
          ref={desktopRowRef}
          className="flex gap-2 whitespace-nowrap"
          style={{ transform: `scale(${scale})`, transformOrigin: "left top" }}
        >
          {cats.map((c) => {
            const isActive = active === c.slug;
            return (
              <li key={c.slug}>
                <a
                  href={`#${c.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(c.slug);
                  }}
                  className={cx(
                    "px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors",
                    "border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/40",
                    isActive && "bg-red-500/15 border-red-500/50"
                  )}
                >
                  {c.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
