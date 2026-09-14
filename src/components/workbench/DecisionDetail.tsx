import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DisagreementCompare } from '@/components/workbench/DisagreementCompare';
import { InvestigationChain } from '@/components/workbench/InvestigationChain';
import { agentById } from '@/data/agents';
import { agentIcon, categoryLabel, decisionStatusLabel } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import type { AgentId, Decision } from '@/types/domain';

interface DecisionDetailProps {
  decision: Decision;
  readOnly?: boolean;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  onRequestInfo: (id: string, note: string) => void;
  onSideWith: (id: string, agentId: AgentId, note?: string) => void;
}

type PendingAction = 'approve' | 'reject' | 'info' | null;

function confidenceTone(confidence: number) {
  if (confidence >= 0.8) return 'success' as const;
  if (confidence >= 0.6) return 'alternative' as const;
  return 'warning' as const;
}

export function DecisionDetail({
  decision,
  readOnly = false,
  onApprove,
  onReject,
  onRequestInfo,
  onSideWith,
}: DecisionDetailProps) {
  const [tab, setTab] = useState('summary');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [note, setNote] = useState('');

  const isActive = decision.status === 'pending' || decision.status === 'info-requested';
  const requestingAgent = agentById.get(decision.requestingAgent);

  function reset() {
    setPendingAction(null);
    setNote('');
  }

  function confirm() {
    if (pendingAction === 'approve') onApprove(decision.id, note || undefined);
    if (pendingAction === 'reject') onReject(decision.id, note || undefined);
    if (pendingAction === 'info' && note.trim()) onRequestInfo(decision.id, note.trim());
    reset();
  }

  const sidedWith =
    decision.humanRecord?.action === 'sided-a' || decision.humanRecord?.action === 'sided-b'
      ? decision.humanRecord.action
      : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="border-stroke-divider shrink-0 border-b px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="alternative" size="sm">
                {categoryLabel[decision.category]}
              </Badge>
              <Badge
                variant={
                  decision.status === 'approved'
                    ? 'success'
                    : decision.status === 'rejected'
                      ? 'error'
                      : decision.status === 'resolved-auto'
                        ? 'alternative'
                        : 'high-emphasis'
                }
                size="sm">
                {decisionStatusLabel[decision.status]}
              </Badge>
            </div>
            <h2 className="headings-h3-semibold text-fg-primary">
              {decision.title}
            </h2>
            {decision.customer && (
              <p className="paragraph-small-primary text-fg-secondary mt-0.5">
                Customer: {decision.customer}
              </p>
            )}
          </div>
          <span className="paragraph-small-primary text-fg-tertiary shrink-0">
            {relativeTime(decision.createdAt)}
          </span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-stroke-divider shrink-0 border-b px-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="investigate">Investigate</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <TabsContent value="summary" className="flex flex-col gap-6">
            <section>
              <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                What happened
              </h3>
              <p className="paragraph-regular-primary text-fg-primary">
                {decision.whatHappened}
              </p>
            </section>

            {decision.disagreement ? (
              <section>
                <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                  Agent positions
                </h3>
                <DisagreementCompare
                  disagreement={decision.disagreement}
                  resolved={!isActive}
                  sidedWith={sidedWith}
                  onSideWith={agentId => onSideWith(decision.id, agentId)}
                  onRequestAnalysis={() =>
                    onRequestInfo(decision.id, 'Requested further analysis before deciding.')
                  }
                />
              </section>
            ) : (
              <section>
                <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                  {requestingAgent?.name} Agent recommends
                </h3>
                <div className="border-stroke-tertiary flex items-start gap-3 border p-4">
                  <IconShell type="neutral" size="default" className="mt-0.5">
                    <Icon icon={agentIcon[decision.requestingAgent]} />
                  </IconShell>
                  <div className="flex-1">
                    <p className="paragraph-regular-emphasised-600 text-fg-primary">
                      {decision.recommendation.action}
                      {decision.recommendation.amount
                        ? ` — ${decision.recommendation.amount}`
                        : ''}
                    </p>
                    <p className="paragraph-regular-primary text-fg-secondary mt-1">
                      {decision.recommendation.rationale}
                    </p>
                  </div>
                  <Badge variant={confidenceTone(decision.confidence)} size="sm">
                    {Math.round(decision.confidence * 100)}% confidence
                  </Badge>
                </div>
              </section>
            )}

            <section>
              <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                Evidence used
              </h3>
              <ul className="flex flex-col gap-2">
                {decision.evidence.map(item => (
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
            </section>

            <section>
              <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                Relevant policy
              </h3>
              <div className="bg-fill-onsurface-ui-1 p-3">
                <p className="label-small-primary text-fg-primary">
                  {decision.policy.name}
                </p>
                <p className="paragraph-small-primary text-fg-secondary mt-1 italic">
                  {decision.policy.excerpt}
                </p>
                <p className="paragraph-small-primary text-fg-tertiary mt-1.5">
                  {Math.round(decision.policy.matchConfidence * 100)}% match confidence
                </p>
              </div>
            </section>

            {decision.unusualFactors.length > 0 && (
              <section>
                <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                  Unusual or uncertain
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {decision.unusualFactors.map(factor => (
                    <li key={factor} className="flex items-start gap-2">
                      <IconShell type="custom" size="sm" className="text-status-warning mt-0.5">
                        <Icon icon="warning" />
                      </IconShell>
                      <span className="paragraph-regular-primary text-fg-primary">
                        {factor}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                Why this reached you
              </h3>
              <p className="paragraph-regular-primary text-fg-primary">
                {decision.escalationReason}
              </p>
            </section>

            {decision.infoRequestNote && (
              <section>
                <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                  Your request for more information
                </h3>
                <p className="paragraph-regular-primary text-fg-primary bg-fill-onsurface-ui-1 p-3">
                  {decision.infoRequestNote}
                </p>
              </section>
            )}

            <section>
              <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                Agents involved
              </h3>
              <div className="flex flex-wrap gap-2">
                {decision.involvedAgents.map(id => (
                  <span
                    key={id}
                    className="border-stroke-tertiary inline-flex items-center gap-1.5 border px-2 py-1">
                    <IconShell type="neutral" size="sm">
                      <Icon icon={agentIcon[id]} />
                    </IconShell>
                    <span className="paragraph-small-primary text-fg-primary">
                      {agentById.get(id)?.name}
                    </span>
                  </span>
                ))}
              </div>
            </section>

            {decision.humanRecord && (
              <section>
                <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                  Human decision
                </h3>
                <div className="border-stroke-active border-l-2 pl-3">
                  <p className="paragraph-regular-primary text-fg-primary">
                    {decision.humanRecord.changedRecommendation
                      ? 'Overrode the agent’s recommendation.'
                      : `${decision.humanRecord.action === 'approved' ? 'Approved' : 'Rejected'} as recommended.`}
                  </p>
                  {decision.humanRecord.note && (
                    <p className="paragraph-small-primary text-fg-secondary mt-1">
                      {decision.humanRecord.note}
                    </p>
                  )}
                  <p className="paragraph-small-primary text-fg-tertiary mt-1">
                    {relativeTime(decision.humanRecord.timestamp)}
                  </p>
                </div>
              </section>
            )}

            <div className="h-2" />
          </TabsContent>

          <TabsContent value="investigate">
            <InvestigationChain chain={decision.chain} />
            <div className="h-2" />
          </TabsContent>
        </div>
      </Tabs>

      {!readOnly && isActive && !decision.disagreement && (
        <div className="border-stroke-divider shrink-0 border-t px-6 py-4">
          {pendingAction ? (
            <div className="flex flex-col gap-2">
              <Label size="sm">
                {pendingAction === 'info'
                  ? 'What do you need to know before deciding?'
                  : 'Add a note (optional)'}
              </Label>
              <Textarea
                autoFocus
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={
                  pendingAction === 'approve'
                    ? 'e.g. Approved, but flag the tier ambiguity for policy review.'
                    : pendingAction === 'reject'
                      ? 'Explain why, so the agent can learn from this.'
                      : 'e.g. Check whether this customer has a linked account.'
                }
                size="sm"
                className="min-h-[72px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={confirm}
                  disabled={pendingAction === 'info' && !note.trim()}>
                  Confirm
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setPendingAction('approve')}>
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction('reject')}>
                Reject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTab('investigate')}>
                Investigate
              </Button>
              <Separator orientation="vertical" className="mx-1 h-8" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingAction('info')}>
                Ask for more information
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
