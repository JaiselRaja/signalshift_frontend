type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
