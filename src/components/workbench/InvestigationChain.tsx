import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { ChainStage } from '@/types/domain';

interface InvestigationChainProps {
  chain: ChainStage[];
}

function confidenceBadge(confidence?: number) {
  if (confidence === undefined) return null;

  const pct = Math.round(confidence * 100);
  const variant = confidence >= 0.8 ? 'success' : confidence >= 0.6 ? 'alternative' : 'warning';

  return (
    <Badge variant={variant} size="sm">
      {pct}% confidence
    </Badge>
  );
}

export function InvestigationChain({ chain }: InvestigationChainProps) {
  return (
    <div>
      <p className="paragraph-small-primary text-fg-tertiary mb-3">
        Background → Knowledge → Policy → Agent reasoning → Recommendation.
        Expand a stage to inspect what it drew on.
      </p>
      <Accordion
        multiple
        defaultValue={chain.filter(s => s.flagged).map(s => s.id)}>
        {chain.map((stage, index) => (
          <div key={stage.id}>
            <AccordionItem value={stage.id}>
              <AccordionTrigger>
                <span className="text-fg-tertiary paragraph-small-primary w-5 shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1 text-left">{stage.title}</span>
                <span className="flex items-center gap-2">
                  {stage.flagged && (
                    <Badge variant="warning" size="sm">
                      Flagged
                    </Badge>
                  )}
                  {confidenceBadge(stage.confidence)}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="paragraph-regular-primary text-fg-primary mb-3">
                  {stage.summary}
                </p>
                <ul className="flex flex-col gap-2">
                  {stage.details.map(item => (
                    <li
                      key={item.label}
                      className="border-stroke-divider border-l-2 pl-3">
                      <p className="label-small-primary text-fg-primary">
                        {item.label}
                      </p>
                      <p className="paragraph-small-primary text-fg-secondary">
                        {item.detail}
                      </p>
                      <p className="paragraph-small-primary text-fg-tertiary mt-0.5">
                        Source: {item.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            {index < chain.length - 1 && (
              <div
                aria-hidden
                className="border-stroke-divider ml-[10px] h-3 w-px border-l"
              />
            )}
          </div>
        ))}
      </Accordion>
    </div>
  );
}
