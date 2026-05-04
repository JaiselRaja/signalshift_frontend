type Stat = { value: string; label: string };

export default function PageStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/[0.06] md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-start bg-[#0a0b0c] p-5 md:p-6">
          <span className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            {s.value}
          </span>
          <span className="mt-1 text-xs text-white/50">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
