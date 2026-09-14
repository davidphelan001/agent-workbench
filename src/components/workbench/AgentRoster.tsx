import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { StatusBadge } from '@/components/ui/badge';
import { agentIcon, statusDotVariant, statusLabel } from '@/lib/meta';
import type { Agent } from '@/types/domain';

interface AgentRosterProps {
  agents: Agent[];
}

export function AgentRoster({ agents }: AgentRosterProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Heph</CardTitle>
      </CardHeader>
      <CardContent className="gap-0 pb-6">
        <ul className="flex flex-col">
          {agents.map((agent, index) => (
            <li
              key={agent.id}
              className="flex items-start gap-3 py-3"
              style={{
                borderTop: index === 0 ? undefined : '1px solid var(--border-divider)',
              }}>
              <IconShell type="neutral" size="default" className="mt-0.5">
                <Icon icon={agentIcon[agent.id]} />
              </IconShell>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="label-regular-primary text-fg-primary">
                    {agent.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <StatusBadge
                      variant={statusDotVariant[agent.status]}
                      size="sm"
                    />
                    <span className="paragraph-small-primary text-fg-secondary">
                      {statusLabel[agent.status]}
                    </span>
                  </span>
                </div>
                <p className="paragraph-small-primary text-fg-secondary mt-0.5 truncate">
                  {agent.currentTask ?? agent.role}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="paragraph-small-emphasised text-fg-primary">
                  {agent.tasksCompletedToday}
                </p>
                <p className="paragraph-small-primary text-fg-tertiary">
                  done today
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
