import { cn } from '@/lib/utils';
import type { View } from '@/App';

interface NavItem {
  id: View;
  label: string;
  count?: number;
  accent?: boolean;
}

interface NavRailProps {
  active: View;
  onSelect: (view: View) => void;
  ideaCount: number;
  critCount: number;
}

export function NavRail({ active, onSelect, ideaCount, critCount }: NavRailProps) {
  const items: NavItem[] = [
    { id: 'overview', label: 'At a glance' },
    { id: 'inquiries', label: 'Ideas', count: ideaCount },
    { id: 'queue', label: 'Crit queue', count: critCount, accent: true },
    { id: 'activity', label: 'Heph’s activity' },
    { id: 'audit', label: 'History' },
  ];

  return (
    <nav
      aria-label="Primary"
      className="border-stroke-divider flex h-full w-52 shrink-0 flex-col border-r px-6 py-8">
      <div className="font-headings text-fg-primary mb-10 text-lg leading-6 font-normal tracking-tight">
        Hephwerk
      </div>

      <ul className="flex flex-col gap-4">
        {items.map(item => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'paragraph-regular-primary group flex items-baseline gap-1.5 text-left transition-colors',
                  isActive ? 'text-fg-primary font-semibold' : 'text-fg-tertiary hover:text-fg-secondary',
                )}>
                <span
                  className={cn(
                    'underline-offset-4',
                    isActive && 'underline decoration-1',
                  )}>
                  {item.label}
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={cn(
                      'paragraph-small-primary',
                      item.accent ? 'text-brand-accents-qb-accent' : 'text-fg-tertiary',
                    )}>
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
