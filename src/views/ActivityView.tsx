import { useState } from 'react';

import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { SegmentedControls, SegmentedControlsItem } from '@/components/ui/segmented-controls';
import { agentById } from '@/data/agents';
import { activityIcon } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import type { ActivityEvent } from '@/types/domain';

interface ActivityViewProps {
  activity: ActivityEvent[];
  onOpenDecision: (id: string) => void;
}

const significantTypes = new Set([
  'escalated',
  'disagreement',
  'human-decision',
  'uncertainty',
]);

const eventToneClass: Record<string, string> = {
  uncertainty: 'text-status-warning',
  escalated: 'text-status-warning',
  disagreement: 'text-status-error',
  'human-decision': 'text-fg-primary',
};

export function ActivityView({ activity, onOpenDecision }: ActivityViewProps) {
  const [filter, setFilter] = useState<'all' | 'significant'>('all');

  const sorted = [...activity].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const filtered =
    filter === 'significant'
      ? sorted.filter(e => significantTypes.has(e.type))
      : sorted;

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headings-h2-semibold text-fg-primary">Agent activity</h1>
          <p className="paragraph-regular-primary text-fg-secondary mt-1">
            What the organisation has been doing, in the order it happened.
          </p>
        </div>
        <SegmentedControls
          value={filter}
          onValueChange={v => setFilter(v as 'all' | 'significant')}
          size="sm">
          <SegmentedControlsItem value="all">All activity</SegmentedControlsItem>
          <SegmentedControlsItem value="significant">
            Needed attention
          </SegmentedControlsItem>
        </SegmentedControls>
      </div>

      <ol className="flex flex-col">
        {filtered.map((event, index) => {
          const agent = agentById.get(event.agentId);
          const tone = eventToneClass[event.type] ?? 'text-fg-secondary';

          return (
            <li key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <IconShell type="custom" size="sm" className={tone}>
                  <Icon icon={activityIcon[event.type]} />
                </IconShell>
                {index < filtered.length - 1 && (
                  <div className="bg-stroke-divider mt-1 w-px flex-1" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-6">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="paragraph-regular-primary text-fg-primary">
                    <span className="font-semibold">{agent?.name} Agent</span>{' '}
                    {event.summary.charAt(0).toLowerCase() + event.summary.slice(1)}
                    {event.involvedAgentId && (
                      <>
                        {' '}
                        <span className="text-fg-secondary">
                          ({agentById.get(event.involvedAgentId)?.name} Agent)
                        </span>
                      </>
                    )}
                  </p>
                  <span className="paragraph-small-primary text-fg-tertiary shrink-0">
                    {relativeTime(event.timestamp)}
                  </span>
                </div>
                {event.detail && (
                  <p className="paragraph-small-primary text-fg-secondary mt-0.5">
                    {event.detail}
                  </p>
                )}
                {event.relatedDecisionId && (
                  <button
                    type="button"
                    onClick={() => onOpenDecision(event.relatedDecisionId!)}
                    className="paragraph-small-primary-link text-fg-secondary mt-1 cursor-pointer">
                    View decision
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
