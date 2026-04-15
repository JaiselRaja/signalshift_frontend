type Props = { sport: string; size?: "xs" | "sm" };

const SPORT_STYLES: Record<string, string> = {
  football: "bg-indigo-500/10 text-indigo-400",
  cricket: "bg-emerald-500/10 text-emerald-400",
  hockey: "bg-amber-500/10 text-amber-400",
  badminton: "bg-sky-500/10 text-sky-400",
  tennis: "bg-violet-500/10 text-violet-400",
  basketball: "bg-orange-500/10 text-orange-400",
  volleyball: "bg-pink-500/10 text-pink-400",
};

export default function SportTag({ sport, size = "sm" }: Props) {
  const style = SPORT_STYLES[sport.toLowerCase()] ?? "bg-slate-500/10 text-slate-400";
  const textSize = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-md font-medium capitalize ${textSize} ${style}`}>
      {sport}
    </span>
  );
}
