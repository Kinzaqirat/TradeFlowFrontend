interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export default function KPICard({ title, value, subtitle, valueColor, icon }: KPICardProps) {
  return (
    <div className="card p-5 hover:border-[var(--accent-green)]/20 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{title}</span>
        {icon && <div className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)] transition-colors">{icon}</div>}
      </div>
      <div className={`font-mono text-2xl font-bold tracking-tight ${valueColor || "text-[var(--text-primary)]"}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-[var(--text-muted)] mt-1.5 font-medium">{subtitle}</div>
      )}
    </div>
  );
}
