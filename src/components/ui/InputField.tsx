type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function InputField({ label, error, hint, className = "", ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-[#707a6a]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none transition-colors focus:bg-white ${
          error
            ? "border-red-500/40 focus:border-red-500/60"
            : "border-[#bfcab7]/30 focus:border-[#004900]/40 focus:ring-2 focus:ring-[#004900]/10"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[#707a6a]">{hint}</p>}
    </div>
  );
}
