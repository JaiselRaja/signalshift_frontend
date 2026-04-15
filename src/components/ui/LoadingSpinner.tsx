type Props = { size?: "sm" | "md" | "lg"; className?: string };

export default function LoadingSpinner({ size = "md", className = "" }: Props) {
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-7 w-7";
  const border = size === "sm" ? "border-2" : "border-2";
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${dim} ${border} rounded-full border-white/10 border-t-indigo-500 animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
