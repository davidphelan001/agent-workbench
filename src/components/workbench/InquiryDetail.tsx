import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { inquiryStatusLabel } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import type { Inquiry } from '@/types/domain';

interface InquiryDetailProps {
  inquiry: Inquiry;
  readOnly?: boolean;
  onAccept: (id: string, note?: string) => void;
  onChallenge: (id: string, note: string) => void;
  onGoDeeper: (id: string, note?: string) => void;
  onAskForEvidence: (id: string, note?: string) => void;
  onReviseProposition: (proposition: string) => void;
}

type PendingAction = 'accept' | 'challenge' | 'deeper' | 'evidence' | null;

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="bg-fg-tertiary mt-2.5 size-1 shrink-0 rounded-full" />
          <span className="paragraph-large-primary text-fg-primary">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-stroke-divider border-t py-10 first:border-t-0 first:pt-0">
      {eyebrow && (
        <p className="label-small-primary text-fg-tertiary mb-1 uppercase">{eyebrow}</p>
      )}
      <h2 className="headings-h3-regular text-fg-primary mb-5">{title}</h2>
      {children}
    </section>
  );
}

const statusColor: Record<Inquiry['status'], string> = {
  investigating: 'text-fg-tertiary',
  revising: 'text-fg-tertiary',
  ready: 'text-brand-accents-qb-accent',
  accepted: 'text-fg-secondary',
};

export function InquiryDetail({
  inquiry,
  readOnly = false,
  onAccept,
  onChallenge,
  onGoDeeper,
  onAskForEvidence,
  onReviseProposition,
}: InquiryDetailProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [note, setNote] = useState('');

  const isActive = inquiry.status === 'ready';
  const isWorking = inquiry.status === 'investigating' || inquiry.status === 'revising';
  const { interpretation, critique, synthesis, reframe } = inquiry;

  function reset() {
    setPendingAction(null);
    setNote('');
  }

  function confirm() {
    if (pendingAction === 'accept') onAccept(inquiry.id, note || undefined);
    if (pendingAction === 'challenge' && note.trim()) onChallenge(inquiry.id, note.trim());
    if (pendingAction === 'deeper') onGoDeeper(inquiry.id, note || undefined);
    if (pendingAction === 'evidence') onAskForEvidence(inquiry.id, note || undefined);
    reset();
  }

  const tensions = Array.from(
    new Set([...critique.contradictions, ...critique.framingIssues, ...synthesis.contested]),
  );
  const uncertain = Array.from(
    new Set([...synthesis.uncertain, ...synthesis.missing, ...inquiry.secondOrderEffects]),
  );
  const judgementLead = tensions[0] ?? uncertain[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[720px] flex-col px-8 py-14">
        <header className="mb-4 flex items-center gap-3">
          <span className={`label-regular-primary ${statusColor[inquiry.status]}`}>
            {inquiryStatusLabel[inquiry.status]}
          </span>
          <span className="text-fg-tertiary">·</span>
          <span className="paragraph-small-primary text-fg-tertiary">
            {relativeTime(inquiry.createdAt)}
          </span>
        </header>

        <h1 className="headings-h1-regular text-fg-primary mb-3">{inquiry.proposition}</h1>
        {inquiry.context && (
          <p className="paragraph-large-primary text-fg-secondary">{inquiry.context}</p>
        )}

        {isWorking ? (
          <p className="paragraph-large-primary text-fg-secondary border-stroke-divider mt-10 border-t pt-10">
            {inquiry.status === 'revising'
              ? 'Heph is reconsidering this — check Heph’s activity to follow along.'
              : 'Heph is still working through this — check Heph’s activity to follow along.'}
          </p>
        ) : (
          <>
            <Section eyebrow="Interpretation" title="What Heph understood">
              <p className="paragraph-large-primary text-fg-primary mb-5">
                {interpretation.coreClaim}
              </p>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="label-small-primary text-fg-tertiary mb-2 uppercase">
                    Assumptions
                  </p>
                  <Bullets items={interpretation.assumptions} />
                </div>
                <div>
                  <p className="label-small-primary text-fg-tertiary mb-2 uppercase">
                    Ambiguities
                  </p>
                  <Bullets items={interpretation.ambiguities} />
                </div>
                <div>
                  <p className="label-small-primary text-fg-tertiary mb-2 uppercase">
                    What you may actually be proposing
                  </p>
                  <Bullets items={interpretation.alternativeReadings} />
                </div>
              </div>
            </Section>

            <Section eyebrow={`${inquiry.disciplines.length} disciplines`} title="Evidence and perspectives">
              <div className="flex flex-col gap-8">
                {inquiry.disciplines.map(d => (
                  <div key={d.name}>
                    <p className="paragraph-large-primary text-fg-primary font-semibold">
                      {d.name}
                    </p>
                    <p className="paragraph-small-primary text-fg-tertiary mt-0.5 mb-2">
                      {d.relevance}
                    </p>
                    <p className="paragraph-large-primary text-fg-primary">{d.contribution}</p>
                  </div>
                ))}
                {inquiry.systemsView.map(s => (
                  <div key={s.dimension}>
                    <p className="paragraph-large-primary text-fg-primary font-semibold">
                      {s.dimension}
                    </p>
                    <p className="paragraph-large-primary text-fg-primary mt-2">
                      {s.observation}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Challenges">
              <div className="flex flex-col gap-6">
                <Bullets
                  items={[
                    ...critique.weakAssumptions,
                    ...critique.failureModes,
                    ...critique.alternativeInterpretations,
                  ]}
                />
              </div>
            </Section>

            <Section title="Tensions and contradictions">
              <Bullets items={tensions} />
            </Section>

            <Section title="Synthesis">
              <p className="headings-h3-regular text-fg-primary mb-3">
                {reframe.strengthened}
              </p>
              <p className="paragraph-large-primary text-fg-secondary mb-6">
                {reframe.rationale}
              </p>
              <div>
                <p className="label-small-primary text-fg-tertiary mb-2 uppercase">
                  Well supported
                </p>
                <Bullets items={synthesis.wellSupported} />
              </div>
              <p className="paragraph-large-primary text-fg-secondary mt-6">
                {synthesis.whatChanged}
              </p>
            </Section>

            <Section title="What remains uncertain">
              <Bullets items={uncertain} />
            </Section>

            {inquiry.rounds.length > 0 && (
              <Section title="Exchange so far">
                <div className="flex flex-col gap-6">
                  {inquiry.rounds.map(round => (
                    <div key={round.id}>
                      <p className="paragraph-small-primary text-fg-tertiary">
                        You{' '}
                        {round.type === 'challenge'
                          ? 'challenged this'
                          : round.type === 'deeper'
                            ? 'asked for deeper investigation'
                            : 'asked for more evidence'}
                        {round.note ? `: “${round.note}”` : ''}
                        {' · '}
                        {relativeTime(round.timestamp)}
                      </p>
                      <p className="paragraph-large-primary text-fg-primary mt-1">
                        {round.response}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section eyebrow="Crit" title="Where Heph needs your judgement">
              {judgementLead && (
                <p className="paragraph-large-primary text-fg-primary mb-6">{judgementLead}</p>
              )}

              {readOnly ? (
                inquiry.humanRecord?.note && (
                  <p className="paragraph-large-primary text-fg-secondary border-brand-accents-qb-accent border-l-2 pl-4">
                    {inquiry.humanRecord.note}
                  </p>
                )
              ) : !isActive ? null : pendingAction ? (
                <div className="flex flex-col gap-3">
                  <Label size="sm">
                    {pendingAction === 'challenge'
                      ? 'What do you disagree with?'
                      : 'Add a note (optional)'}
                  </Label>
                  <Textarea
                    autoFocus
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={
                      pendingAction === 'accept'
                        ? 'e.g. Agreed — this is a better framing than what I started with.'
                        : pendingAction === 'challenge'
                          ? 'Say where the synthesis gets it wrong.'
                          : pendingAction === 'deeper'
                            ? 'e.g. Push harder on the governance question.'
                            : 'e.g. What would actually change your mind here?'
                    }
                    className="min-h-[96px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={confirm}
                      disabled={pendingAction === 'challenge' && !note.trim()}>
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setPendingAction('accept')}>
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPendingAction('challenge')}>
                    Challenge
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPendingAction('deeper')}>
                    Go deeper
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPendingAction('evidence')}>
                    Ask for more evidence
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReviseProposition(reframe.strengthened)}>
                    Revise the proposition
                  </Button>
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
