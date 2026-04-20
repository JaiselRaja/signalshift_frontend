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
              ? "border-white/10 text-white/40 line-through"
              : "border-[#b2f746]/30 bg-[#b2f746]/[0.08] text-[#b2f746]"
          }`}
        >
          {a.available !== false && <CheckIcon />}
          {a.name}
        </div>
      ))}
    </div>
  );
}
