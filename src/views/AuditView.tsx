import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { DecisionDetail } from '@/components/workbench/DecisionDetail';
import { InquiryDetail } from '@/components/workbench/InquiryDetail';
import { agentById } from '@/data/agents';
import { categoryIcon, inquiryIcon } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { AgentId, Decision, Inquiry } from '@/types/domain';

interface AuditViewProps {
  decisions: Decision[];
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const noop = () => {};
const noopInfo = (_id: string, _note: string) => {};
const noopSide = (_id: string, _agentId: AgentId, _note?: string) => {};
const noopChallenge = (_id: string, _note: string) => {};
const noopRevise = (_proposition: string) => {};

type AuditItem =
  | { kind: 'decision'; id: string; data: Decision; resolvedAt: string }
  | { kind: 'inquiry'; id: string; data: Inquiry; resolvedAt: string };

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

export function AuditView({ decisions, inquiries, selectedId, onSelect }: AuditViewProps) {
  const resolvedDecisions = decisions.filter(
    d => d.status === 'approved' || d.status === 'rejected' || d.status === 'resolved-auto',
  );
  const acceptedInquiries = inquiries.filter(i => i.status === 'accepted');

  const items: AuditItem[] = [
    ...resolvedDecisions.map(d => ({
      kind: 'decision' as const,
      id: d.id,
      data: d,
      resolvedAt: d.resolvedAt ?? d.createdAt,
    })),
    ...acceptedInquiries.map(i => ({
      kind: 'inquiry' as const,
      id: i.id,
      data: i,
      resolvedAt: i.resolvedAt ?? i.createdAt,
    })),
  ].sort((a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime());

  const selected = items.find(item => item.id === selectedId) ?? items[0] ?? null;

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[380px] shrink-0 flex-col border-r">
        <div className="border-stroke-divider shrink-0 border-b px-5 py-4">
          <h1 className="headings-h3-semibold text-fg-primary">Audit history</h1>
          <p className="paragraph-small-primary text-fg-secondary mt-0.5">
            {items.length} resolved items, decisions and inquiries.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'border-stroke-divider hover:bg-stateslayer-overlay-hover flex w-full flex-col items-start gap-1.5 border-b px-5 py-4 text-left transition-colors',
                    selected?.id === item.id && 'bg-fill-onsurface-ui-1',
                  )}>
                  <div className="flex w-full items-center gap-2">
                    <IconShell type="neutral" size="sm">
                      <Icon
                        icon={item.kind === 'decision' ? categoryIcon[item.data.category] : inquiryIcon}
                      />
                    </IconShell>
                    <span className="label-regular-primary text-fg-primary min-w-0 flex-1 truncate">
                      {item.kind === 'decision' ? item.data.title : item.data.proposition}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.kind === 'decision' ? (
                      outcomeBadge(item.data)
                    ) : (
                      <Badge variant="success" size="sm">
                        Accepted
                      </Badge>
                    )}
                    <span className="paragraph-small-primary text-fg-tertiary">
                      {relativeTime(item.resolvedAt)}
                    </span>
                  </div>
                  <p className="paragraph-small-primary text-fg-secondary">
                    {item.kind === 'decision'
                      ? item.data.status === 'resolved-auto'
                        ? `Handled by ${agentById.get(item.data.requestingAgent)?.name} Agent`
                        : 'Reviewed by a human'
                      : 'Synthesis accepted'}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        {selected ? (
          selected.kind === 'decision' ? (
            <DecisionDetail
              key={selected.id}
              decision={selected.data}
              readOnly
              onApprove={noop}
              onReject={noop}
              onRequestInfo={noopInfo}
              onSideWith={noopSide}
            />
          ) : (
            <InquiryDetail
              key={selected.id}
              inquiry={selected.data}
              readOnly
              onAccept={noop}
              onChallenge={noopChallenge}
              onGoDeeper={noop}
              onAskForEvidence={noop}
              onReviseProposition={noopRevise}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-secondary">
              No resolved items yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
