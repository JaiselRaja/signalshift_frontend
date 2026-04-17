"use client";

const SPORT_OPTIONS = ["football", "cricket", "hockey", "badminton", "tennis", "basketball"];

type Props = {
  cities: string[];
  cityFilter: string | null;
  sportFilter: string | null;
  searchQuery: string;
  onCity: (c: string | null) => void;
  onSport: (s: string | null) => void;
  onSearch: (q: string) => void;
};

export default function TurfFilters({
  cities, cityFilter, sportFilter, searchQuery, onCity, onSport, onSearch,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707a6a]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search turfs..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-lg border border-[#bfcab7]/30 bg-white py-2.5 pl-9 pr-4 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-[#004900]/40 focus:ring-2 focus:ring-[#004900]/10"
        />
      </div>

      {/* City filter */}
      {cities.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCity(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !cityFilter
                ? "bg-[#004900]/15 text-[#004900]"
                : "bg-[#f3f4f5] text-[#404a3b] hover:bg-[#e7e8e9]"
            }`}
          >
            All Cities
          </button>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => onCity(cityFilter === c ? null : c)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                cityFilter === c
                  ? "bg-[#004900]/15 text-[#004900]"
                  : "bg-[#f3f4f5] text-[#404a3b] hover:bg-[#e7e8e9]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Sport filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSport(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !sportFilter
              ? "bg-[#004900]/15 text-[#004900]"
              : "bg-[#f3f4f5] text-[#404a3b] hover:bg-[#e7e8e9]"
          }`}
        >
          All Sports
        </button>
        {SPORT_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSport(sportFilter === s ? null : s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              sportFilter === s
                ? "bg-[#004900]/15 text-[#004900]"
                : "bg-[#f3f4f5] text-[#404a3b] hover:bg-[#e7e8e9]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
