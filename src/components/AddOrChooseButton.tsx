// src/components/AddOrChooseButton.tsx
"use client";

import { useMemo, useState } from "react";
import { useCallList } from "@/components/CallList";

type Price = number | { sm?: number; md?: number; lg?: number };

type ItemLite = {
  id: string;
  name: string;
  price: Price;
  tags?: string[]; // forward soyPaper tag, etc.
};

const COMBO_CONFIG: Record<
  string,
  { label: string; max: number; choices: string[]; group?: "classic" | "premium"; needsSide?: boolean }
> = {
  "two-roll-combo": {
    label: "Choose any 2 rolls:",
    max: 2,
    choices: ["california-roll", "crunchy-roll", "fresh-salmon-roll", "snow-crab-roll", "shrimp-tempura-roll", "bbq-eel-roll"],
    group: "classic",
    needsSide: false,
  },
  "roll-combo": {
    label: "Choose any 3 classic rolls:",
    max: 3,
    choices: ["acadiana-roll", "california-roll", "crunchy-roll", "cucumber-roll", "fresh-salmon-roll", "philadelphia-roll", "shrimp-tempura-roll", "snow-crab-roll", "tuna-roll", "vegetable-roll", "spider-roll"],
    group: "classic",
    needsSide: true,
  },
  "super-roll": {
    label: "Choose any 3 premium rolls:",
    max: 3,
    choices: ["bobby-roll", "brandon-roll", "elizabeth-roll", "jesti-roll", "karen-roll", "lorie-roll", "shannon-roll", "spider-roll", "scott-roll"],
    group: "premium",
    needsSide: true,
  },
};

type SideChoice = "miso" | "salad";

export default function AddOrChooseButton({
  item,
  allRolls,
}: {
  item: ItemLite;
  allRolls: { id: string; name: string }[];
}) {
  const { add } = useCallList();
  const cfg = COMBO_CONFIG[item.id];

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [side, setSide] = useState<SideChoice | null>(cfg?.needsSide ? "miso" : null);

  // ✅ Hooks must be called on every render (even when !cfg)
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of allRolls) map.set(r.id, r.name);
    return map;
  }, [allRolls]);

  const choices = useMemo(() => {
    const ids = cfg?.choices ?? []; // safe when !cfg
    const needle = q.trim().toLowerCase();
    return ids
      .map((id) => ({ id, name: nameById.get(id) ?? id }))
      .filter((x) => !needle || x.name.toLowerCase().includes(needle));
  }, [cfg?.choices, nameById, q]);

  // If this item doesn't need choices, behave like tiny "+" but include tags
  if (!cfg) {
    return (
      <button
        onClick={() => add({ id: item.id, name: item.name, price: item.price, tags: item.tags })}
        className="h-8 w-8 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 active:scale-[0.98] grid place-items-center"
        aria-label={`Add ${item.name}`}
        title={`Add ${item.name}`}
      >
        +
      </button>
    );
  }

  function togglePick(id: string) {
    setPicks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < cfg.max ? [...prev, id] : prev
    );
  }

  function confirm() {
    const chosen = picks.map((id) => nameById.get(id) ?? id);
    const details = [...chosen];

    if (cfg.needsSide && side) {
      details.push(`Side: ${side === "miso" ? "Miso Soup" : "House Salad"}`);
    }

    add({
      id: `${item.id}:${picks.join("+")}${cfg.needsSide && side ? `:${side}` : ""}`,
      name: item.name,
      price: item.price,
      details,
      // combos don’t carry tags themselves
    });

    setOpen(false);
    setPicks([]);
    setQ("");
    setSide(cfg.needsSide ? "miso" : null);
  }

  const remaining = cfg.max - picks.length;
  const canConfirm = picks.length === cfg.max && (!cfg.needsSide || !!side);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-8 w-8 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 active:scale-[0.98] grid place-items-center"
        aria-label={`Choose options for ${item.name}`}
        title={`Choose options for ${item.name}`}
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-background shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm opacity-70">{item.name}</div>
                <h3 className="text-lg font-semibold">{cfg.label}</h3>
                <div className="text-xs opacity-70 mt-0.5">{remaining} selection{remaining === 1 ? "" : "s"} left</div>
              </div>
              <button className="h-8 w-8 grid place-items-center rounded-full border border-white/15 hover:bg-white/5" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            {/* Search (optional UI; keep state for future) */}
            {/* <div className="px-3 py-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rolls…" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div> */}

            {/* Roll choices */}
            <div className="max-h-[50vh] overflow-y-auto px-3 pb-3">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {choices.map((c) => {
                  const checked = picks.includes(c.id);
                  const disabled = !checked && picks.length >= cfg.max;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => togglePick(c.id)}
                        disabled={disabled}
                        className={[
                          "w-full px-3 py-2 rounded-lg border transition flex items-center justify-between gap-2",
                          checked ? "border-red-500/60 bg-red-500/10"
                            : disabled ? "border-white/10 bg-white/5 opacity-50"
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                        ].join(" ")}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="ml-2 text-xs opacity-70 shrink-0 overflow-x-auto whitespace-nowrap max-w-[50%]"></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {cfg.needsSide ? <hr className="mx-3 my-2 border-white/10" /> : null}

            {cfg.needsSide ? (
              <div className="px-3 pb-3">
                <div className="text-sm font-medium mb-2">Choose one side:</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className={["flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer", side === "miso" ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"].join(" ")}>
                    <input type="radio" name="side" className="accent-red-600" checked={side === "miso"} onChange={() => setSide("miso")} />
                    <span>Miso Soup</span>
                  </label>
                  <label className={["flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer", side === "salad" ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"].join(" ")}>
                    <input type="radio" name="side" className="accent-red-600" checked={side === "salad"} onChange={() => setSide("salad")} />
                    <span>House Salad</span>
                  </label>
                </div>
              </div>
            ) : null}

            <div className="p-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button onClick={() => { setPicks([]); setQ(""); setSide(cfg.needsSide ? "miso" : null); }} className="btn btn--ghost px-3 py-1.5 text-sm">Clear</button>
              <button onClick={confirm} disabled={!canConfirm} className={["px-4 py-1.5 rounded-md text-sm transition border", canConfirm ? "border-red-500/60 bg-red-600 text-white hover:bg-red-500" : "border-white/15 bg-white/5 opacity-60 cursor-not-allowed"].join(" ")}>
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
