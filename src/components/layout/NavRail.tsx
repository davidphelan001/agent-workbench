import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { NumericBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { View } from '@/App';

interface NavItem {
  id: View;
  label: string;
  icon: string;
  count?: number;
}

interface NavRailProps {
  active: View;
  onSelect: (view: View) => void;
  queueCount: number;
  disagreementCount: number;
}

export function NavRail({
  active,
  onSelect,
  queueCount,
  disagreementCount,
}: NavRailProps) {
  const items: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    {
      id: 'queue',
      label: 'Judgement queue',
      icon: 'gavel',
      count: queueCount,
    },
    {
      id: 'activity',
      label: 'Agent activity',
      icon: 'timeline',
    },
    { id: 'audit', label: 'Audit history', icon: 'history' },
  ];

  return (
    <nav
      aria-label="Primary"
      className="bg-surface-primary border-stroke-divider flex h-full w-60 shrink-0 flex-col border-r">
      <div className="flex h-14 items-center gap-2 px-4">
        <IconShell type="custom" className="text-fg-primary" size="default">
          <Icon icon="hub" />
        </IconShell>
        <span className="headings-h4-semibold text-fg-primary">
          Agent Workbench
        </span>
      </div>

      <ul className="flex flex-col gap-0.5 px-2 py-2">
        {items.map(item => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 px-2 py-2 text-left transition-colors',
                'label-regular-primary text-fg-secondary hover:bg-stateslayer-overlay-hover hover:text-fg-primary',
                active === item.id &&
                  'bg-fill-onsurface-ui-2 text-fg-primary font-semibold',
              )}>
              <IconShell type="neutral" size="sm">
                <Icon icon={item.icon} />
              </IconShell>
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'queue' && disagreementCount > 0 && (
                <span
                  className="bg-status-warning size-1.5 shrink-0 rounded-full"
                  aria-label={`${disagreementCount} unresolved disagreement`}
                />
              )}
              {typeof item.count === 'number' && item.count > 0 && (
                <NumericBadge size="sm" variant="secondary">
                  {item.count}
                </NumericBadge>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-stroke-divider px-4 py-3">
        <p className="paragraph-small-primary text-fg-tertiary">
          Prototype · mocked agent data
        </p>
      </div>
    </nav>
  );
}
