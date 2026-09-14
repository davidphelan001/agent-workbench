import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { DecisionDetail } from '@/components/workbench/DecisionDetail';
import { agentById } from '@/data/agents';
import { categoryIcon } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { AgentId, Decision } from '@/types/domain';

interface AuditViewProps {
  decisions: Decision[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const noop = () => {};
const noopInfo = (_id: string, _note: string) => {};
const noopSide = (_id: string, _agentId: AgentId, _note?: string) => {};

function outcomeBadge(decision: Decision) {
  if (decision.status === 'rejected') {
    return (
      <Badge variant="error" size="sm">
        Rejected
      </Badge>
    );
  }
  if (decision.status === 'resolved-auto') {
    return (
      <Badge variant="alternative" size="sm">
        Resolved autonomously
      </Badge>
    );
  }
  if (decision.humanRecord?.changedRecommendation) {
    return (
      <Badge variant="warning" size="sm">
        Human overrode recommendation
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      Approved
    </Badge>
  );
}

export function AuditView({ decisions, selectedId, onSelect }: AuditViewProps) {
  const resolved = decisions
    .filter(
      d =>
        d.status === 'approved' ||
        d.status === 'rejected' ||
        d.status === 'resolved-auto',
    )
    .sort(
      (a, b) =>
        new Date(b.resolvedAt ?? b.createdAt).getTime() -
        new Date(a.resolvedAt ?? a.createdAt).getTime(),
    );
  const selected = resolved.find(d => d.id === selectedId) ?? resolved[0] ?? null;

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[380px] shrink-0 flex-col border-r">
        <div className="border-stroke-divider shrink-0 border-b px-5 py-4">
          <h1 className="headings-h3-semibold text-fg-primary">Audit history</h1>
          <p className="paragraph-small-primary text-fg-secondary mt-0.5">
            {resolved.length} resolved decisions, human and autonomous.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul>
            {resolved.map(decision => (
              <li key={decision.id}>
                <button
                  type="button"
                  onClick={() => onSelect(decision.id)}
                  className={cn(
                    'border-stroke-divider hover:bg-stateslayer-overlay-hover flex w-full flex-col items-start gap-1.5 border-b px-5 py-4 text-left transition-colors',
                    selected?.id === decision.id && 'bg-fill-onsurface-ui-1',
                  )}>
                  <div className="flex w-full items-center gap-2">
                    <IconShell type="neutral" size="sm">
                      <Icon icon={categoryIcon[decision.category]} />
                    </IconShell>
                    <span className="label-regular-primary text-fg-primary min-w-0 flex-1 truncate">
                      {decision.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {outcomeBadge(decision)}
                    <span className="paragraph-small-primary text-fg-tertiary">
                      {relativeTime(decision.resolvedAt ?? decision.createdAt)}
                    </span>
                  </div>
                  <p className="paragraph-small-primary text-fg-secondary">
                    {decision.status === 'resolved-auto'
                      ? `Handled by ${agentById.get(decision.requestingAgent)?.name} Agent`
                      : 'Reviewed by a human'}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        {selected ? (
          <DecisionDetail
            key={selected.id}
            decision={selected}
            readOnly
            onApprove={noop}
            onReject={noop}
            onRequestInfo={noopInfo}
            onSideWith={noopSide}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-secondary">
              No resolved decisions yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
