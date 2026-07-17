import { Link } from 'react-router-dom';

type StatCardTone = 'neutral' | 'amber' | 'orange';

const toneStyles: Record<StatCardTone, string> = {
  neutral: 'text-neutral-900',
  amber: 'text-status-amber-text',
  orange: 'text-status-orange-text',
};

interface StatCardProps {
  readonly value: number;
  readonly label: string;
  readonly to: string;
  readonly tone?: StatCardTone;
}

export default function StatCard({ value, label, to, tone = 'neutral' }: StatCardProps) {
  return (
    <Link
      to={to}
      className="min-w-[92px] px-4 py-3 bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft hover:border-brand-300 hover:shadow-card transition-colors"
    >
      <div className={`text-2xl font-bold ${toneStyles[tone]}`}>{value}</div>
      <div className="text-xs text-neutral-500 mt-1 whitespace-nowrap">{label}</div>
    </Link>
  );
}
