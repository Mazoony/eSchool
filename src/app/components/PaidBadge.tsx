import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function PaidBadge({ isPaid }: { isPaid?: boolean }) {
  if (!isPaid) return null;

  return (
    <CheckBadgeIcon
      aria-label="Paid account"
      role="img"
      title="Paid account"
      className="inline-block h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
    />
  );
}
