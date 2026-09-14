import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { DecisionDetail } from '@/components/workbench/DecisionDetail';
import { relativeTime } from '@/lib/time';
import { categoryIcon } from '@/lib/meta';
import { cn } from '@/lib/utils';
import type { AgentId, Decision } from '@/types/domain';

interface QueueViewProps {
  decisions: Decision[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  onRequestInfo: (id: string, note: string) => void;
  onSideWith: (id: string, agentId: AgentId, note?: string) => void;
}

export function QueueView({
  decisions,
  selectedId,
  onSelect,
  onApprove,
  onReject,
  onRequestInfo,
  onSideWith,
}: QueueViewProps) {
  const queue = decisions.filter(
    d => d.status === 'pending' || d.status === 'info-requested',
  );
  const selected = queue.find(d => d.id === selectedId) ?? queue[0] ?? null;

  // A decision that exists but isn't in the active queue yet (e.g. agents
  // are still working on something just commissioned) shouldn't silently
  // fall back to a different item — say plainly that it isn't ready.
  const selectedButNotReady =
    !selected && selectedId
      ? decisions.find(d => d.id === selectedId)
      : undefined;

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[360px] shrink-0 flex-col border-r">
        <div className="border-stroke-divider shrink-0 border-b px-5 py-4">
          <h1 className="headings-h3-semibold text-fg-primary">
            Judgement queue
          </h1>
          <p className="paragraph-small-primary text-fg-secondary mt-0.5">
            {queue.length} {queue.length === 1 ? 'item needs' : 'items need'} your input.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <p className="paragraph-regular-primary text-fg-secondary p-5">
              Nothing waiting on you right now.
            </p>
          ) : (
            <ul>
              {queue.map(decision => (
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
                    <p className="paragraph-small-primary text-fg-secondary line-clamp-2">
                      {decision.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      {decision.disagreement && (
                        <Badge variant="warning" size="sm">
                          Agents disagree
                        </Badge>
                      )}
                      {decision.status === 'info-requested' && (
                        <Badge variant="alternative" size="sm">
                          Awaiting information
                        </Badge>
                      )}
                      <span className="paragraph-small-primary text-fg-tertiary">
                        {relativeTime(decision.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        {selected ? (
          <DecisionDetail
            key={selected.id}
            decision={selected}
            onApprove={onApprove}
            onReject={onReject}
            onRequestInfo={onRequestInfo}
            onSideWith={onSideWith}
          />
        ) : selectedButNotReady ? (
          <div className="flex h-full items-center justify-center px-8">
            <p className="paragraph-regular-primary text-fg-secondary max-w-sm text-center">
              “{selectedButNotReady.title}” isn’t ready for you yet — agents
              are still working on it. Check Agent activity to follow along.
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-secondary">
              Select an item to review it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
