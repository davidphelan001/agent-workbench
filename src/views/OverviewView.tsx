import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import {
  Statistic,
  StatisticLabel,
  StatisticValue,
} from '@/components/ui/statistic';
import { AgentRoster } from '@/components/workbench/AgentRoster';
import { relativeTime } from '@/lib/time';
import { inquiryIcon } from '@/lib/meta';
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
    <div className="mx-auto flex w-full max-w-[1120px] gap-8 px-8 py-8">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="headings-h2-semibold text-fg-primary">At a glance</h1>
            <p className="paragraph-regular-primary text-fg-secondary mt-1">
              What you're currently working on, what has changed, and what may need you.
            </p>
          </div>
          <Button onClick={onStartInquiry} className="shrink-0">
            New idea
          </Button>
        </div>

        <div className="flex gap-8">
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

        <section className="flex flex-col gap-3">
          <h2 className="headings-h4-semibold text-fg-primary">
            Needs your attention
          </h2>

          {needsAttention.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-6">
                <p className="paragraph-regular-primary text-fg-secondary">
                  Nothing needs you right now. Heph is working through your ideas
                  on its own.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {needsAttention.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenInquiry(item.id)}
                  className="text-left">
                  <Card
                    size="sm"
                    className="hover:border-stroke-tertiary-hover border border-transparent transition-colors">
                    <CardContent className="flex items-start gap-3 py-4">
                      <IconShell type="neutral" size="default" className="mt-0.5">
                        <Icon icon={inquiryIcon} />
                      </IconShell>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="label-regular-primary text-fg-primary truncate">
                            {item.proposition}
                          </span>
                          <Badge variant="alternative" size="sm">
                            Ready for you
                          </Badge>
                        </div>
                        <p className="paragraph-small-primary text-fg-secondary mt-1 line-clamp-2">
                          {item.reframe.strengthened}
                        </p>
                      </div>
                      <span className="paragraph-small-primary text-fg-tertiary shrink-0">
                        {relativeTime(item.createdAt)}
                      </span>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="headings-h4-semibold text-fg-primary">
              Since you last checked
            </h2>
            <Button variant="ghost" size="sm" onClick={onGoToActivity}>
              View all activity
            </Button>
          </div>

          <Card size="sm">
            <CardContent className="gap-0 py-2">
              <ul className="flex flex-col">
                {significantActivity.map((event, index) => (
                  <li
                    key={event.id}
                    className="flex items-start gap-3 py-3"
                    style={{
                      borderTop:
                        index === 0 ? undefined : '1px solid var(--border-divider)',
                    }}>
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
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>

      <aside className="w-[320px] shrink-0">
        <AgentRoster agents={agents} />
      </aside>
    </div>
  );
}
