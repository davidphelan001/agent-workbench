import { useState, type ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <ul className="flex flex-col gap-1.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2">
          <span className="bg-fill-active mt-2 size-1 shrink-0 rounded-full" />
          <span className="paragraph-regular-primary text-fg-primary">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="label-small-primary text-fg-tertiary uppercase">{title}</h4>
      {children}
    </div>
  );
}

const statusVariant: Record<Inquiry['status'], 'high-emphasis' | 'alternative' | 'success'> = {
  investigating: 'alternative',
  revising: 'alternative',
  ready: 'high-emphasis',
  accepted: 'success',
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
  const [tab, setTab] = useState('synthesis');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [note, setNote] = useState('');

  const isActive = inquiry.status === 'ready';

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

  const { interpretation, critique, synthesis, reframe } = inquiry;

  return (
    <div className="flex h-full flex-col">
      <div className="border-stroke-divider shrink-0 border-b px-6 py-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Badge variant={statusVariant[inquiry.status]} size="sm">
            {inquiryStatusLabel[inquiry.status]}
          </Badge>
          <span className="paragraph-small-primary text-fg-tertiary shrink-0">
            {relativeTime(inquiry.createdAt)}
          </span>
        </div>
        <p className="paragraph-large-primary text-fg-secondary border-stroke-tertiary border-l-2 pl-3 italic">
          {inquiry.proposition}
        </p>
        {inquiry.context && (
          <p className="paragraph-small-primary text-fg-tertiary mt-2 pl-3.5">
            Context: {inquiry.context}
          </p>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-stroke-divider shrink-0 border-b px-6">
          <TabsList>
            <TabsTrigger value="synthesis">Synthesis</TabsTrigger>
            <TabsTrigger value="investigation">Investigation</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <TabsContent value="synthesis" className="flex flex-col gap-6">
            {inquiry.status === 'investigating' || inquiry.status === 'revising' ? (
              <p className="paragraph-regular-primary text-fg-secondary py-4">
                {inquiry.status === 'revising'
                  ? 'The organisation is reconsidering this inquiry — check Agent activity to follow along.'
                  : 'The organisation is still working through this — check Agent activity to follow along.'}
              </p>
            ) : (
              <>
                <section>
                  <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                    Strengthened framing
                  </h3>
                  <p className="headings-h3-regular text-fg-primary">
                    {reframe.strengthened}
                  </p>
                  <p className="paragraph-regular-primary text-fg-secondary mt-2">
                    {reframe.rationale}
                  </p>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SubSection title="Well supported">
                    <div className="text-success">
                      <Bullets items={synthesis.wellSupported} />
                    </div>
                  </SubSection>
                  <SubSection title="Uncertain">
                    <div className="text-fg-secondary">
                      <Bullets items={synthesis.uncertain} />
                    </div>
                  </SubSection>
                  <SubSection title="Contested">
                    <div className="text-warning">
                      <Bullets items={synthesis.contested} />
                    </div>
                  </SubSection>
                  <SubSection title="Missing">
                    <div className="text-fg-tertiary">
                      <Bullets items={synthesis.missing} />
                    </div>
                  </SubSection>
                </section>

                <section>
                  <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                    What changed
                  </h3>
                  <p className="paragraph-regular-primary text-fg-primary">
                    {synthesis.whatChanged}
                  </p>
                </section>

                {inquiry.rounds.length > 0 && (
                  <section>
                    <h3 className="label-regular-primary text-fg-secondary mb-1.5">
                      Exchange with you
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {inquiry.rounds.map(round => (
                        <li key={round.id} className="border-stroke-divider border-l-2 pl-3">
                          <p className="paragraph-small-primary text-fg-tertiary">
                            You{' '}
                            {round.type === 'challenge'
                              ? 'challenged this'
                              : round.type === 'deeper'
                                ? 'asked for deeper investigation'
                                : 'asked for more evidence'}
                            {round.note ? `: “${round.note}”` : ''}
                          </p>
                          <p className="paragraph-regular-primary text-fg-primary mt-1">
                            {round.response}
                          </p>
                          <p className="paragraph-small-primary text-fg-tertiary mt-1">
                            {relativeTime(round.timestamp)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            <div className="h-2" />
          </TabsContent>

          <TabsContent value="investigation" className="flex flex-col gap-2">
            <p className="paragraph-small-primary text-fg-tertiary mb-1">
              How the synthesis was reached — inspectable, not a transcript of
              private reasoning.
            </p>
            <Accordion multiple defaultValue={['interpretation']}>
              <AccordionItem value="interpretation">
                <AccordionTrigger>Interpretation</AccordionTrigger>
                <AccordionContent className="gap-4">
                  <p className="paragraph-regular-primary text-fg-primary">
                    {interpretation.coreClaim}
                  </p>
                  <SubSection title="Assumptions">
                    <Bullets items={interpretation.assumptions} />
                  </SubSection>
                  <SubSection title="Ambiguities">
                    <Bullets items={interpretation.ambiguities} />
                  </SubSection>
                  <SubSection title="Concepts that need defining">
                    <ul className="flex flex-col gap-1.5">
                      {interpretation.conceptsToDefine.map(c => (
                        <li key={c.term}>
                          <span className="label-small-primary text-fg-primary">{c.term}</span>
                          <span className="paragraph-regular-primary text-fg-secondary">
                            {' '}
                            — {c.note}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SubSection>
                  <SubSection title="What you may actually be proposing">
                    <Bullets items={interpretation.alternativeReadings} />
                  </SubSection>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disciplines">
                <AccordionTrigger>
                  Perspectives consulted
                  <Badge variant="alternative" size="sm">
                    {inquiry.disciplines.length}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent className="gap-4">
                  {inquiry.disciplines.map(d => (
                    <div key={d.name} className="border-stroke-divider border-l-2 pl-3">
                      <p className="label-regular-primary text-fg-primary">{d.name}</p>
                      <p className="paragraph-small-primary text-fg-tertiary mt-0.5">
                        {d.relevance}
                      </p>
                      <p className="paragraph-regular-primary text-fg-primary mt-1">
                        {d.contribution}
                      </p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="critique">
                <AccordionTrigger>Critique</AccordionTrigger>
                <AccordionContent className="gap-4">
                  <SubSection title="Weak assumptions">
                    <Bullets items={critique.weakAssumptions} />
                  </SubSection>
                  <SubSection title="Contradictions">
                    <Bullets items={critique.contradictions} />
                  </SubSection>
                  <SubSection title="Missing evidence">
                    <Bullets items={critique.missingEvidence} />
                  </SubSection>
                  <SubSection title="Alternative interpretations">
                    <Bullets items={critique.alternativeInterpretations} />
                  </SubSection>
                  <SubSection title="How this could fail">
                    <Bullets items={critique.failureModes} />
                  </SubSection>
                  <SubSection title="Where the framing may be wrong">
                    <Bullets items={critique.framingIssues} />
                  </SubSection>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="systems">
                <AccordionTrigger>Systems view</AccordionTrigger>
                <AccordionContent className="gap-4">
                  <ul className="flex flex-col gap-3">
                    {inquiry.systemsView.map(s => (
                      <li key={s.dimension}>
                        <span className="label-small-primary text-fg-primary">
                          {s.dimension}
                        </span>
                        <p className="paragraph-regular-primary text-fg-secondary mt-0.5">
                          {s.observation}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <SubSection title="Second-order effects">
                    <Bullets items={inquiry.secondOrderEffects} />
                  </SubSection>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="h-2" />
          </TabsContent>
        </div>
      </Tabs>

      {!readOnly && isActive && (
        <div className="border-stroke-divider shrink-0 border-t px-6 py-4">
          {pendingAction ? (
            <div className="flex flex-col gap-2">
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
                size="sm"
                className="min-h-[72px]"
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
              <Separator orientation="vertical" className="mx-1 h-8" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReviseProposition(reframe.strengthened)}>
                Revise the proposition
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
