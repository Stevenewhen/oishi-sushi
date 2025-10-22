// src/app/menu/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import { CallListProvider, CallListFloatingBar } from "@/components/CallList";
import AddOrChooseButton from "@/components/AddOrChooseButton";
import CategoryNav from "@/components/CategoryNav";

type Price =
  | number
  | {
      sm?: number;
      md?: number;
      lg?: number;
    };

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: Price;
  tags?: string[];
  photoUrl?: string;
  sort?: number;
};

type MenuCategory = {
  slug: string;
  title: string;
  items: MenuItem[];
  sort?: number;
};

// ---- safer loader that skips bad/empty JSON and reports which file failed
async function getMenu(): Promise<MenuCategory[]> {
  const dir = path.join(process.cwd(), "content/menu");
  const files = await fs.readdir(dir);

  const categories: MenuCategory[] = [];

  for (const f of files) {
    if (!f.toLowerCase().endsWith(".json")) continue;

    const full = path.join(dir, f);
    try {
      const cleaned = (await fs.readFile(full, "utf8")).replace(/^\uFEFF/, "").trim();
      if (!cleaned) {
        console.warn(`[menu] Skipping empty JSON file: ${f}`);
        continue;
      }

      const parsed: unknown = JSON.parse(cleaned);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof (parsed as { slug?: unknown }).slug !== "string" ||
        typeof (parsed as { title?: unknown }).title !== "string" ||
        !Array.isArray((parsed as { items?: unknown }).items)
      ) {
        console.warn(`[menu] Skipping invalid menu file (shape): ${f}`);
        continue;
      }

      const cat = parsed as MenuCategory;

      // Sort items for stable UI
      cat.items.sort((a: MenuItem, b: MenuItem) => {
        const as = a.sort ?? 0;
        const bs = b.sort ?? 0;
        if (as !== bs) return as - bs;
        return a.name.localeCompare(b.name);
      });

      categories.push(cat);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[menu] Failed parsing ${f}: ${msg}`);
      continue;
    }
  }

  // Sort categories by sort then title
  return categories.sort((a, b) => {
    const as = a.sort ?? 0;
    const bs = b.sort ?? 0;
    if (as !== bs) return as - bs;
    return a.title.localeCompare(b.title);
  });
}

function Price({ price }: { price: Price }) {
  if (typeof price === "number") return <span>${price.toFixed(2)}</span>;
  if (!price || typeof price !== "object") return <span>—</span>;
  const parts = Object.entries(price).map(
    ([k, v]) => `${k.toUpperCase()} $${(Number(v) || 0).toFixed(2)}`
  );
  return <span>{parts.join(" / ")}</span>;
}

// Tag emoji
const TAG_EMOJI: Record<string, { emoji: string; label: string; cls?: string }> = {
  spicy: { emoji: "🌶️", label: "SPICY", cls: "text-red-300 border-red-400/40" },
  soyPaper: { emoji: "📜", label: "SOY PAPER" },
  deepFried: { emoji: "🍤", label: "DEEP-FRIED" },
  raw: { emoji: "🍣", label: "RAW" },
};

export default async function MenuPage() {
  const categories = await getMenu();

  // Flat list of roll ids -> names for chooser
  const allRolls = categories
    .filter((c) => c.slug === "sushi-rolls" || c.slug === "sushi-rolls-with-soypaper")
    .flatMap((c) => c.items.map((i) => ({ id: i.id, name: i.name })));

  return (
    <CallListProvider>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-6">Menu</h1>

        {/* Category navigation: dropdown on mobile, wrapped chips on desktop */}
        <CategoryNav cats={categories.map((c) => ({ slug: c.slug, title: c.title }))} />

        {/* Sections */}
        {categories.map((cat) => (
          <section id={cat.slug} key={cat.slug} className="scroll-mt-24 mt-8 mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">{cat.title}</h2>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item, idx) => (
                <li
                  key={`${cat.slug}:${item.id ?? idx}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight">{item.name}</h3>

                      {item.description ? (
                        <p className="text-sm opacity-75 mt-1 line-clamp-2">{item.description}</p>
                      ) : null}

                      {/* Tag badges */}
                      {item.tags?.length ? (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {item.tags.map((tag) => {
                            const meta = TAG_EMOJI[tag] || { emoji: "🔸", label: tag };
                            return (
                              <span
                                key={`${item.id}:${tag}`}
                                className={`text-[11px] px-2 py-0.5 rounded-full border border-white/15 opacity-90 inline-flex items-center gap-1 ${meta.cls ?? ""}`}
                              >
                                <span>{meta.emoji}</span>
                                <span>{meta.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    {/* Price + + button */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="tabular-nums whitespace-nowrap text-sm opacity-90">
                        <Price price={item.price} />
                      </span>

                      <AddOrChooseButton
                        item={{
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          tags: item.tags,
                        }}
                        allRolls={allRolls}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Soy paper swap note (page-level reminder) */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">📜</span>
            <p className="leading-5">
              Swap any roll to soy paper for <strong>+$0.50 per roll</strong>. Just ask when
              ordering.
            </p>
          </div>
        </div>

        {/* Sticky bottom bar that shows when items are in the list */}
        <CallListFloatingBar telHref="tel:+13372620106" />
      </main>
    </CallListProvider>
  );
}
