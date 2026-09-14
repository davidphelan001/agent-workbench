import { Button } from '@/components/ui/button';
import {
  Statistic,
  StatisticLabel,
  StatisticValue,
} from '@/components/ui/statistic';
import { relativeTime } from '@/lib/time';
import { agentById } from '@/data/agents';
import type { Agent, ActivityEvent, Inquiry } from '@/types/domain';

interface OverviewViewProps {
  agents: Agent[];
  inquiries: Inquiry[];
  activity: ActivityEvent[];
  onOpenInquiry: (id: string) => void;
  onGoToActivity: () => void;
  onStartInquiry: () => void;
}

const significantTypes = new Set(['escalated', 'human-decision', 'uncertainty']);

export function OverviewView({
  agents,
  inquiries,
  activity,
  onOpenInquiry,
  onGoToActivity,
  onStartInquiry,
}: OverviewViewProps) {
  const needsAttention = inquiries
    .filter(i => i.status === 'ready')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const blockedAgents = agents.filter(a => a.status === 'blocked' || a.status === 'uncertain');
  const tasksCompletedToday = agents.reduce((sum, a) => sum + a.tasksCompletedToday, 0);
  const significantActivity = activity
    .filter(e => significantTypes.has(e.type))
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-[760px] px-8 py-14">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="headings-h2-regular text-fg-primary">At a glance</h1>
            <p className="paragraph-regular-primary text-fg-secondary mt-1">
              What you're currently working on, what has changed, and what may need you.
            </p>
          </div>
          <Button onClick={onStartInquiry} className="shrink-0">
            New idea
          </Button>
        </div>

        <div className="mb-14 flex gap-10">
          <Statistic size="sm">
            <StatisticLabel>Worked on today</StatisticLabel>
            <StatisticValue value={tasksCompletedToday} />
          </Statistic>
          <Statistic size="sm">
            <StatisticLabel>Waiting on your critique</StatisticLabel>
            <StatisticValue value={needsAttention.length} />
          </Statistic>
          <Statistic size="sm">
            <StatisticLabel>Heph uncertain or blocked</StatisticLabel>
            <StatisticValue value={blockedAgents.length} />
          </Statistic>
        </div>

        <section className="mb-14">
          <h2 className="headings-h4-regular text-fg-primary mb-4">
            Needs your attention
          </h2>

          {needsAttention.length === 0 ? (
            <p className="paragraph-regular-primary text-fg-tertiary">
              Nothing needs you right now. Heph is working through your ideas on its own.
            </p>
          ) : (
            <div>
              {needsAttention.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenInquiry(item.id)}
                  className="border-stroke-divider hover:bg-stateslayer-overlay-hover flex w-full items-start gap-4 border-t py-5 text-left transition-colors first:border-t-0">
                  <div className="min-w-0 flex-1">
                    <p className="paragraph-large-primary text-fg-primary">
                      {item.proposition}
                    </p>
                    <p className="paragraph-small-primary text-fg-secondary mt-1 line-clamp-2">
                      {item.reframe.strengthened}
                    </p>
                  </div>
                  <span className="paragraph-small-primary text-fg-tertiary shrink-0">
                    {relativeTime(item.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="headings-h4-regular text-fg-primary">
              Since you last checked
            </h2>
            <Button variant="ghost" size="sm" onClick={onGoToActivity}>
              View all activity
            </Button>
          </div>

          <div>
            {significantActivity.map(event => (
              <div key={event.id} className="border-stroke-divider flex items-start gap-3 border-t py-4 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <p className="paragraph-regular-primary text-fg-primary">
                    <span className="font-semibold">
                      {event.type === 'human-decision' ? 'You' : agentById.get(event.agentId)?.name}
                    </span>{' '}
                    {event.summary.charAt(0).toLowerCase() + event.summary.slice(1)}
                  </p>
                  {event.detail && (
                    <p className="paragraph-small-primary text-fg-secondary mt-0.5">
                      {event.detail}
                    </p>
                  )}
                </div>
                <span className="paragraph-small-primary text-fg-tertiary shrink-0">
                  {relativeTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
