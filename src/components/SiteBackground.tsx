// src/components/SiteBackground.tsx
export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Sushi banner image via your .hero-bg::before CSS */}
      <div className="absolute inset-0 hero-bg" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Top-to-bottom gradient into var(--background) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
    </div>
  );
}
