type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function InputField({ label, error, hint, className = "", ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-white/[0.03] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:bg-white/[0.05] ${
          error
            ? "border-red-500/40 focus:border-red-500/60"
            : "border-white/[0.08] focus:border-indigo-500/50"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
