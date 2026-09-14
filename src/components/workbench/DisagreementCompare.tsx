import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { agentIcon } from '@/lib/meta';
import { agentById } from '@/data/agents';
import type { AgentPosition, Disagreement } from '@/types/domain';

interface DisagreementCompareProps {
  disagreement: Disagreement;
  resolved: boolean;
  sidedWith?: 'sided-a' | 'sided-b';
  onSideWith: (agentId: AgentPosition['agentId']) => void;
  onRequestAnalysis: () => void;
}

function PositionColumn({
  position,
  won,
}: {
  position: AgentPosition;
  won: boolean;
}) {
  const agent = agentById.get(position.agentId);

  return (
    <div
      className={`flex-1 border p-4 ${won ? 'border-stroke-active' : 'border-stroke-tertiary'}`}>
      <div className="mb-2 flex items-center gap-2">
        <IconShell type="neutral" size="sm">
          <Icon icon={agentIcon[position.agentId]} />
        </IconShell>
        <span className="label-regular-primary text-fg-primary">
          {agent?.name} Agent
        </span>
        {won && (
          <Badge variant="success" size="sm">
            Human sided with this
          </Badge>
        )}
      </div>
      <p className="paragraph-regular-primary text-fg-primary mb-3">
        {position.position}
      </p>
      <p className="paragraph-small-primary text-fg-tertiary mb-2">
        {Math.round(position.confidence * 100)}% confidence
      </p>
      <ul className="flex flex-col gap-2">
        {position.evidence.map(item => (
          <li key={item.label} className="border-stroke-divider border-l-2 pl-3">
            <p className="label-small-primary text-fg-primary">{item.label}</p>
            <p className="paragraph-small-primary text-fg-secondary">
              {item.detail}
            </p>
            <p className="paragraph-small-primary text-fg-tertiary mt-0.5">
              Source: {item.source}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DisagreementCompare({
  disagreement,
  resolved,
  sidedWith,
  onSideWith,
  onRequestAnalysis,
}: DisagreementCompareProps) {
  const [a, b] = disagreement.positions;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-fill-onsurface-ui-1 flex items-start gap-3 p-4">
        <IconShell type="custom" className="text-fg-secondary mt-0.5" size="sm">
          <Icon icon="fork_right" />
        </IconShell>
        <div>
          <p className="label-regular-primary text-fg-primary">
            Where they diverge
          </p>
          <p className="paragraph-regular-primary text-fg-secondary mt-1">
            {disagreement.pointOfDivergence}
          </p>
          <p className="paragraph-small-primary text-fg-tertiary mt-2">
            {disagreement.autoResolvable
              ? 'The system judged this resolvable without human input.'
              : `Not resolved automatically: ${disagreement.reasonNotAutoResolved}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <PositionColumn position={a} won={sidedWith === 'sided-a'} />
        <PositionColumn position={b} won={sidedWith === 'sided-b'} />
      </div>

      {!resolved && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => onSideWith(a.agentId)}>
            Side with {agentById.get(a.agentId)?.name} Agent
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSideWith(b.agentId)}>
            Side with {agentById.get(b.agentId)?.name} Agent
          </Button>
          <Button variant="ghost" size="sm" onClick={onRequestAnalysis}>
            Request further analysis
          </Button>
        </div>
      )}
    </div>
  );
}
