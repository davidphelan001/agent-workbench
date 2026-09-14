import { StatusBadge } from '@/components/ui/badge';
import { statusDotVariant, statusLabel } from '@/lib/meta';
import type { Agent } from '@/types/domain';

interface AgentRosterProps {
  agents: Agent[];
}

export function AgentRoster({ agents }: AgentRosterProps) {
  return (
    <div>
      <h2 className="label-small-primary text-fg-tertiary mb-4 uppercase">Heph</h2>
      <ul className="flex flex-col">
        {agents.map((agent, index) => (
          <li
            key={agent.id}
            className={`flex flex-col gap-1 py-4 ${index === 0 ? '' : 'border-stroke-divider border-t'}`}>
            <div className="flex items-center gap-2">
              <StatusBadge variant={statusDotVariant[agent.status]} size="sm" />
              <span className="paragraph-large-primary text-fg-primary">{agent.name}</span>
              <span className="paragraph-small-primary text-fg-tertiary ml-auto">
                {statusLabel[agent.status]}
              </span>
            </div>
            <p className="paragraph-small-primary text-fg-secondary">
              {agent.currentTask ?? agent.role}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
