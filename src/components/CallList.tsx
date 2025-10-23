// src/components/CallList.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Price = number | { sm?: number; md?: number; lg?: number };

type ListItem = {
  id: string;
  name: string;
  price: Price;
  qty: number;
  tags?: string[];
  details?: string[];
};

type Ctx = {
  items: ListItem[];
  add: (item: Omit<ListItem, "qty">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CallListCtx = createContext<Ctx | null>(null);

// ---- Config ----
const TAX_RATE = 0.09;

// Sushi rolls that should show soy note
const SOY_NOTE_ROLL_IDS = new Set<string>([
  "acadiana-roll",
  "baked-salmon-roll",
  "bobby-roll",
  "california-roll",
  "crunchy-roll",
  "cucumber-roll",
  "dragon-roll",
  "dynamite-roll",
  "elizabeth-roll",
  "fathers-roll",
  "fresh-salmon-roll",
  "katherine-roll",
  "karen-roll",
  "lt-roll",
  "marlayna-roll",
  "philadelphia-roll",
  "rainbow-roll",
  "scott-roll",
  "shrimp-tempura-roll",
  "snow-crab-roll",
  "spider-roll",
  "spicy-tuna-roll",
  "tuna-roll",
  "vegetable-roll",
]);

// ---- Utils ----
function priceToNumber(p: Price): number {
  if (typeof p === "number") return p;
  const vals = [p.sm, p.md, p.lg].filter((v): v is number => typeof v === "number");
  return vals.length ? Math.min(...vals) : 0;
}

function buildCopyText(items: ListItem[], est: number, tax: number, grand: number) {
  const lines = items
    .map((i) => {
      const base = `• ${i.qty} × ${i.name}`;
      const subs = i.details?.length ? i.details.map((d) => `   - ${d}`).join("\n") : "";
      return subs ? `${base}\n${subs}` : base;
    })
    .join("\n");
  return (
    `Phone order list:\n${lines}\n\n` +
    `Subtotal: $${est.toFixed(2)}\n` +
    `Tax (9%): $${tax.toFixed(2)}\n` +
    `Total: $${grand.toFixed(2)}`
  );
}

// Robust copy (Clipboard API → textarea fallback)
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ---- Provider & Hook ----
export function CallListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("oishi-call-list");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("oishi-call-list", JSON.stringify(items));
    } catch {}
  }, [items]);

  const api = useMemo<Ctx>(
    () => ({
      items,
      add: (it) =>
        setItems((prev) => {
          const i = prev.findIndex((p) => p.id === it.id);
          if (i >= 0) {
            const next = [...prev];
            next[i] = { ...next[i], qty: next[i].qty + 1 };
            return next;
          }
          return [...prev, { ...it, qty: 1 }];
        }),
      inc: (id) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p))),
      dec: (id) =>
        setItems((prev) =>
          prev
            .map((p) => (p.id === id ? { ...p, qty: Math.max(0, p.qty - 1) } : p))
            .filter((p) => p.qty > 0)
        ),
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      clear: () => setItems([]),
    }),
    [items]
  );

  return <CallListCtx.Provider value={api}>{children}</CallListCtx.Provider>;
}

export function useCallList() {
  const ctx = useContext(CallListCtx);
  if (!ctx) throw new Error("useCallList must be used inside CallListProvider");
  return ctx;
}

// ---- UI Bits ----
export function AddToListButton(props: { id: string; name: string; price: Price; tags?: string[] }) {
  const { add } = useCallList();
  return (
    <button
      onClick={() => add({ id: props.id, name: props.name, price: props.price, tags: props.tags })}
      className="h-8 w-8 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 active:scale-[0.98] grid place-items-center"
      aria-label={`Add ${props.name}`}
      title={`Add ${props.name}`}
    >
      +
    </button>
  );
}

export function CallListFloatingBar({ telHref }: { telHref: string }) {
  const { items, inc, dec, remove, clear } = useCallList();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<null | "ok" | "err">(null);

  const totalQty = items.reduce((a, b) => a + b.qty, 0);
  const est = items.reduce((a, b) => a + priceToNumber(b.price) * b.qty, 0);
  const tax = est * TAX_RATE;
  const grand = est + tax;

  const nonSoyQty = items.reduce((sum, it) => {
    const isRegularRoll = SOY_NOTE_ROLL_IDS.has(it.id) || /-roll$/.test(it.id);
    const isSoy = Array.isArray(it.tags) && it.tags.includes("soyPaper");
    return isRegularRoll && !isSoy ? sum + it.qty : sum;
  }, 0);
  const showSoyNote = nonSoyQty >= 1;

  // --- NEW: animate the red pill when totalQty increases ---
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const prevQtyRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevQtyRef.current === null) {
      prevQtyRef.current = totalQty; // skip first render
      return;
    }
    const prev = prevQtyRef.current;
    if (totalQty > prev && pillRef.current) {
      const el = pillRef.current;
      el.classList.remove("anim-pill-pop");
      // force reflow to restart animation
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void el.offsetWidth;
      el.classList.add("anim-pill-pop");
    }
    prevQtyRef.current = totalQty;
  }, [totalQty]);

  if (totalQty === 0) return null;

  return (
    <>
      {/* sticky pill */}
      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
        <div className="flex items-center gap-3 rounded-full border border-red-500/40 bg-black/60 backdrop-blur px-3 py-1.5 text-sm shadow-lg shadow-black/30">
          <button
  ref={pillRef}
  className="rounded-full bg-red-600/90 px-3 py-1 text-white hover:bg-red-600"
  onClick={() => setOpen(true)}
  aria-expanded={open}
>
  Your list · {totalQty} item{totalQty > 1 ? "s" : ""}
</button>
          <span className="opacity-80 tabular-nums">Est. ${grand.toFixed(2)}</span>
          <a
            href={telHref}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15"
          >
            Call to Order
          </a>
        </div>
      </div>

      {/* Drawer (mobile) / Modal (desktop) */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute inset-x-0 bottom-0 max-h-[80vh] overflow-auto rounded-t-2xl border border-white/10 bg-zinc-900 p-4
              md:inset-auto md:mx-auto md:my-12 md:max-h-[70vh] md:max-w-3xl md:rounded-2xl
            "
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Your Call-In List</h3>
              <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100">
                ✕
              </button>
            </div>

            <ul className="divide-y divide-white/10">
              {items.map((it) => (
                <li key={it.id} className="py-2 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium whitespace-normal break-words">{it.name}</div>

                    {it.details?.length ? (
                      <ul className="mt-1 text-xs opacity-80 pl-4 list-disc space-y-0.5">
                        {it.details.map((d) => (
                          <li key={d} className="whitespace-normal break-words">
                            {d}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="text-xs opacity-70">
                      Est. ${(priceToNumber(it.price) * it.qty).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-md border border-white/15 hover:bg-white/10"
                      onClick={() => dec(it.id)}
                      aria-label={`Decrease ${it.name}`}
                    >
                      –
                    </button>
                    <span className="w-6 text-center tabular-nums">{it.qty}</span>
                    <button
                      className="h-7 w-7 rounded-md border border-white/15 hover:bg-white/10"
                      onClick={() => inc(it.id)}
                      aria-label={`Increase ${it.name}`}
                    >
                      +
                    </button>
                    <button
                      className="ml-2 text-xs opacity-70 hover:opacity-100 underline"
                      onClick={() => remove(it.id)}
                    >
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between">
              <div className="opacity-80 tabular-nums space-y-0.5">
                <div>Subtotal: <strong>${est.toFixed(2)}</strong></div>
                <div>Tax (9%): <strong>${tax.toFixed(2)}</strong></div>
                <div className="text-base">Total: <strong>${(est + tax).toFixed(2)}</strong></div>
              </div>
              <div className="flex gap-2">
                <button
                  className={`rounded-md border px-3 py-1 text-sm ${
                    copied === "ok"
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : copied === "err"
                      ? "border-red-600/50 bg-red-600/10"
                      : "border-white/15 hover:bg-white/10"
                  }`}
                  onClick={async () => {
                    const text = buildCopyText(items, est, tax, grand);
                    const ok = await copyTextToClipboard(text);
                    setCopied(ok ? "ok" : "err");
                    window.setTimeout(() => setCopied(null), 1500);
                  }}
                >
                  {copied === "ok" ? "Copied!" : copied === "err" ? "Copy failed" : "Copy list"}
                </button>
                <button
                  className="rounded-md border border-red-600/50 bg-red-600/10 px-3 py-1 hover:bg-red-600/20 text-sm"
                  onClick={clear}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Soy paper swap note */}
            {showSoyNote && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">📜</span>
                  <p className="leading-5">
                    Swap any roll to soy paper for <strong>+$0.50 per roll</strong>. Just mention it when you call.
                  </p>
                </div>
              </div>
            )}

            <a
              href={telHref}
              className="mt-3 inline-flex items-center justify-center w-full rounded-lg bg-red-600 text-white py-2 font-medium hover:bg-red-500"
            >
              Call to Order
            </a>
          </div>
        </div>
      )}
    </>
  );
}
