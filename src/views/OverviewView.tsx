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
import { categoryIcon, inquiryIcon } from '@/lib/meta';
import { agentById } from '@/data/agents';
import type { Agent, ActivityEvent, Decision, Inquiry } from '@/types/domain';

interface OverviewViewProps {
  agents: Agent[];
  decisions: Decision[];
  inquiries: Inquiry[];
  activity: ActivityEvent[];
  onOpenDecision: (id: string) => void;
  onOpenInquiry: (id: string) => void;
  onGoToActivity: () => void;
  onStartInquiry: () => void;
}

const significantTypes = new Set([
  'escalated',
  'disagreement',
  'human-decision',
  'uncertainty',
]);

interface AttentionItem {
  id: string;
  kind: 'decision' | 'inquiry';
  icon: string;
  title: string;
  summary: string;
  createdAt: string;
  urgent: boolean;
  badge?: string;
}

export function OverviewView({
  agents,
  decisions,
  inquiries,
  activity,
  onOpenDecision,
  onOpenInquiry,
  onGoToActivity,
  onStartInquiry,
}: OverviewViewProps) {
  const pendingDecisions = decisions.filter(
    d => d.status === 'pending' || d.status === 'info-requested',
  );
  const readyInquiries = inquiries.filter(i => i.status === 'ready');

  const needsAttention: AttentionItem[] = [
    ...pendingDecisions.map(d => ({
      id: d.id,
      kind: 'decision' as const,
      icon: categoryIcon[d.category],
      title: d.title,
      summary: d.summary,
      createdAt: d.createdAt,
      urgent: Boolean(d.disagreement),
      badge: d.disagreement
        ? 'Agents disagree'
        : d.status === 'info-requested'
          ? 'Awaiting information'
          : undefined,
    })),
    ...readyInquiries.map(i => ({
      id: i.id,
      kind: 'inquiry' as const,
      icon: inquiryIcon,
      title: i.proposition,
      summary: i.reframe.strengthened,
      createdAt: i.createdAt,
      urgent: false,
      badge: 'Ready for you',
    })),
  ].sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
            <h1 className="headings-h2-semibold text-fg-primary">Overview</h1>
            <p className="paragraph-regular-primary text-fg-secondary mt-1">
              What the organisation is doing, and what actually needs you right now.
            </p>
          </div>
          <Button onClick={onStartInquiry} className="shrink-0">
            New inquiry
          </Button>
        </div>

        <div className="flex gap-8">
          <Statistic size="sm">
            <StatisticLabel>Tasks completed today</StatisticLabel>
            <StatisticValue value={tasksCompletedToday} />
          </Statistic>
          <Statistic size="sm">
            <StatisticLabel>Waiting on you</StatisticLabel>
            <StatisticValue value={needsAttention.length} />
          </Statistic>
          <Statistic size="sm">
            <StatisticLabel>Agents blocked or uncertain</StatisticLabel>
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
                  Nothing needs you right now. {agents.length} agents are working
                  autonomously.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {needsAttention.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    item.kind === 'decision' ? onOpenDecision(item.id) : onOpenInquiry(item.id)
                  }
                  className="text-left">
                  <Card
                    size="sm"
                    className="hover:border-stroke-tertiary-hover border border-transparent transition-colors">
                    <CardContent className="flex items-start gap-3 py-4">
                      <IconShell type="neutral" size="default" className="mt-0.5">
                        <Icon icon={item.icon} />
                      </IconShell>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="label-regular-primary text-fg-primary truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge variant={item.urgent ? 'warning' : 'alternative'} size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="paragraph-small-primary text-fg-secondary mt-1 line-clamp-2">
                          {item.summary}
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
                          {agentById.get(event.agentId)?.name}
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
