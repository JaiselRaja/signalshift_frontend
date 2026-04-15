type Amenity = { name: string; available?: boolean };

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AmenitiesList({ amenities }: { amenities: Amenity[] }) {
  if (!amenities?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
            a.available === false
              ? "border-white/[0.04] text-[var(--text-muted)] line-through"
              : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
          }`}
        >
          {a.available !== false && <CheckIcon />}
          {a.name}
        </div>
      ))}
    </div>
  );
}
