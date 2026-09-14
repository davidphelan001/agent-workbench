import { useEffect, useRef, useState } from 'react';

import { NavRail } from '@/components/layout/NavRail';
import { StartInquiryDialog } from '@/components/workbench/StartInquiryDialog';
import { agents as initialAgents } from '@/data/agents';
import { initialActivity } from '@/data/activity';
import { initialDecisions } from '@/data/decisions';
import {
  buildInquiry,
  buildRound,
  FAILURE_MODE_POOL,
  SECOND_ORDER_POOL,
  SYSTEMS_DIMENSIONS,
  type InquiryInput,
} from '@/lib/inquiryGenerator';
import { minutesAgo } from '@/lib/time';
import { ActivityView } from '@/views/ActivityView';
import { AuditView } from '@/views/AuditView';
import { InquiriesView } from '@/views/InquiriesView';
import { OverviewView } from '@/views/OverviewView';
import { QueueView } from '@/views/QueueView';
import type { ActivityEvent, Agent, AgentId, Decision, Inquiry } from '@/types/domain';

export type View = 'overview' | 'inquiries' | 'queue' | 'activity' | 'audit';

let eventCounter = 0;
function nextEventId() {
  eventCounter += 1;
  return `evt-${Date.now()}-${eventCounter}`;
}

function shortTitle(text: string, max = 70): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null,
  );
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>(initialActivity);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [revisionSeed, setRevisionSeed] = useState<string | undefined>(undefined);
  const scheduled = useRef(new Set<string>());

  function logEvent(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    setActivity(prev => [{ ...event, id: nextEventId(), timestamp: new Date().toISOString() }, ...prev]);
  }

  function patchAgent(
    id: AgentId,
    patch: Partial<Agent> | ((agent: Agent) => Partial<Agent>),
  ) {
    setAgents(prev =>
      prev.map(a =>
        a.id === id ? { ...a, ...(typeof patch === 'function' ? patch(a) : patch) } : a,
      ),
    );
  }

  function openDecision(id: string, target: View = 'queue') {
    setSelectedDecisionId(id);
    setView(target);
  }

  function openInquiry(id: string) {
    setSelectedInquiryId(id);
    setView('inquiries');
  }

  function updateDecision(id: string, updater: (d: Decision) => Decision) {
    setDecisions(prev => prev.map(d => (d.id === id ? updater(d) : d)));
  }

  function updateInquiry(id: string, updater: (i: Inquiry) => Inquiry) {
    setInquiries(prev => prev.map(i => (i.id === id ? updater(i) : i)));
  }

  function handleApprove(id: string, note?: string) {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;

    updateDecision(id, d => ({
      ...d,
      status: 'approved',
      resolvedAt: new Date().toISOString(),
      humanRecord: {
        action: 'approved',
        changedRecommendation: false,
        note,
        timestamp: new Date().toISOString(),
      },
    }));
    logEvent({
      agentId: decision.requestingAgent,
      type: 'human-decision',
      summary: `Human approved the recommendation for ${decision.title.toLowerCase()}`,
      detail: note,
      relatedDecisionId: id,
    });
  }

  function handleReject(id: string, note?: string) {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;

    updateDecision(id, d => ({
      ...d,
      status: 'rejected',
      resolvedAt: new Date().toISOString(),
      humanRecord: {
        action: 'rejected',
        changedRecommendation: false,
        note,
        timestamp: new Date().toISOString(),
      },
    }));
    logEvent({
      agentId: decision.requestingAgent,
      type: 'human-decision',
      summary: `Human rejected the recommendation for ${decision.title.toLowerCase()}`,
      detail: note,
      relatedDecisionId: id,
    });
  }

  function handleRequestInfo(id: string, note: string) {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;

    updateDecision(id, d => ({
      ...d,
      status: 'info-requested',
      infoRequestNote: note,
    }));
    logEvent({
      agentId: decision.requestingAgent,
      type: 'human-decision',
      summary: `Human asked ${decision.disagreement ? 'agents' : 'an agent'} for more information on ${decision.title.toLowerCase()}`,
      detail: note,
      relatedDecisionId: id,
    });
    scheduleFollowUp(id);
  }

  // Simulate an agent following up after the human asks for more information —
  // closes the "escalate -> judgement -> continued autonomy" loop. Scheduled
  // directly from the action that causes the transition (rather than a
  // useEffect keyed on `decisions`) so an unrelated state update elsewhere
  // can't cancel a follow-up that's already in flight.
  function scheduleFollowUp(id: string) {
    if (scheduled.current.has(id)) return;
    scheduled.current.add(id);

    window.setTimeout(() => {
      setDecisions(prev =>
        prev.map(d =>
          d.id === id && d.status === 'info-requested'
            ? {
                ...d,
                status: 'pending',
                createdAt: minutesAgo(0),
                evidence: [
                  ...d.evidence,
                  {
                    label: 'Follow-up finding',
                    detail: d.disagreement
                      ? 'Additional analysis did not change either agent’s position — the disagreement stands.'
                      : 'Found a linked account under a previous surname with two prior late-delivery contacts, both unresolved.',
                    source: `${d.requestingAgent === 'customer' ? 'Customer' : 'Research'} Agent, follow-up`,
                  },
                ],
              }
            : d,
        ),
      );
      const target = decisions.find(d => d.id === id);
      logEvent({
        agentId: target?.requestingAgent ?? 'customer',
        type: 'task-completed',
        summary: `Responded to the human’s request for more information on ${(target?.title ?? 'the request').toLowerCase()}`,
        relatedDecisionId: id,
      });
    }, 9000);
  }

  function handleSideWith(id: string, agentId: AgentId, note?: string) {
    const decision = decisions.find(d => d.id === id);
    if (!decision?.disagreement) return;

    const [a, b] = decision.disagreement.positions;
    const winner = a.agentId === agentId ? a : b;
    const action = a.agentId === agentId ? 'sided-a' : 'sided-b';

    updateDecision(id, d => ({
      ...d,
      status: 'approved',
      resolvedAt: new Date().toISOString(),
      recommendation: {
        action: winner.position,
        rationale: d.recommendation.rationale,
      },
      humanRecord: {
        action,
        changedRecommendation: false,
        note,
        timestamp: new Date().toISOString(),
      },
    }));
    logEvent({
      agentId: 'reviewer',
      type: 'human-decision',
      summary: `Human sided with the ${agentId} Agent on ${decision.title.toLowerCase()}`,
      relatedDecisionId: id,
    });
  }

  // Submit a proposition. Builds the full interpretation/disciplines/critique/
  // systems/synthesis content up front (status "investigating"), then reveals
  // it in stages through Agent activity so it reads as the organisation
  // actually doing the work — Planner interprets and later synthesises,
  // Research surfaces relevant disciplines, Reviewer critiques and widens the
  // lens — before the inquiry becomes "ready" for the human.
  function handleStartInquiry(input: InquiryInput) {
    const id = `inq-${Date.now()}`;
    const inquiry = buildInquiry(id, input);
    const title = shortTitle(input.proposition);

    setInquiries(prev => [inquiry, ...prev]);
    setView('activity');

    patchAgent('planner', { status: 'working', currentTask: `Interpreting: ${title}` });
    logEvent({
      agentId: 'planner',
      type: 'task-started',
      summary: `Started interpreting: ${title}`,
      detail: input.proposition,
      relatedInquiryId: id,
    });

    window.setTimeout(() => {
      patchAgent('planner', a => ({
        currentTask: `Decomposing: ${title}`,
        tasksCompletedToday: a.tasksCompletedToday + 1,
      }));
      logEvent({
        agentId: 'planner',
        type: 'task-completed',
        summary: `Decomposed the proposition — surfaced ${inquiry.interpretation.assumptions.length} assumptions and ${inquiry.interpretation.ambiguities.length} open ambiguities`,
        relatedInquiryId: id,
      });
    }, 3000);

    window.setTimeout(() => {
      patchAgent('research', a => ({
        status: 'working',
        currentTask: `Consulting relevant disciplines for: ${title}`,
        tasksCompletedToday: a.tasksCompletedToday + 1,
      }));
      logEvent({
        agentId: 'research',
        type: 'task-completed',
        summary: `Consulted ${inquiry.disciplines.length} relevant perspectives: ${inquiry.disciplines.map(d => d.name).join(', ')}`,
        relatedInquiryId: id,
      });
    }, 6500);

    window.setTimeout(() => {
      patchAgent('reviewer', a => ({
        status: 'working',
        currentTask: `Critiquing: ${title}`,
        tasksCompletedToday: a.tasksCompletedToday + 1,
      }));
      logEvent({
        agentId: 'reviewer',
        type: 'uncertainty',
        summary: `Challenged the proposition — found ${inquiry.critique.contradictions.length + inquiry.critique.weakAssumptions.length} points of friction`,
        relatedInquiryId: id,
      });
    }, 10000);

    window.setTimeout(() => {
      patchAgent('reviewer', a => ({
        currentTask: `Widening the lens for: ${title}`,
        tasksCompletedToday: a.tasksCompletedToday + 1,
      }));
      logEvent({
        agentId: 'reviewer',
        type: 'task-completed',
        summary: 'Widened the lens across technology, people, economics, and governance',
        relatedInquiryId: id,
      });
    }, 13000);

    window.setTimeout(() => {
      patchAgent('planner', a => ({
        currentTask: `Synthesising: ${title}`,
        tasksCompletedToday: a.tasksCompletedToday + 1,
      }));
      logEvent({
        agentId: 'planner',
        type: 'escalated',
        summary: `Synthesised perspectives into a strengthened framing — ready for your judgement`,
        relatedInquiryId: id,
      });
      updateInquiry(id, i => ({ ...i, status: 'ready' }));
    }, 16500);
  }

  function handleAccept(id: string, note?: string) {
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    updateInquiry(id, i => ({
      ...i,
      status: 'accepted',
      resolvedAt: new Date().toISOString(),
      humanRecord: { action: 'accepted', note, timestamp: new Date().toISOString() },
    }));
    logEvent({
      agentId: 'planner',
      type: 'human-decision',
      summary: `Human accepted the synthesis for "${shortTitle(inquiry.proposition)}"`,
      detail: note,
      relatedInquiryId: id,
    });
  }

  function scheduleInquiryRound(id: string, type: 'challenge' | 'deeper' | 'evidence', note: string) {
    updateInquiry(id, i => ({ ...i, status: 'revising' }));

    window.setTimeout(() => {
      const { response } = buildRound(type, note);
      const roundId = `round-${Date.now()}`;

      updateInquiry(id, i => {
        let critique = i.critique;
        let systemsView = i.systemsView;
        let secondOrderEffects = i.secondOrderEffects;
        let synthesis = i.synthesis;

        if (type === 'deeper') {
          const nextFailureMode = FAILURE_MODE_POOL.find(f => !critique.failureModes.includes(f));
          if (nextFailureMode) {
            critique = { ...critique, failureModes: [...critique.failureModes, nextFailureMode] };
          }
          const nextDimension = SYSTEMS_DIMENSIONS.find(
            d => !systemsView.some(s => s.dimension === d.dimension),
          );
          if (nextDimension) systemsView = [...systemsView, nextDimension];
          const nextEffect = SECOND_ORDER_POOL.find(e => !secondOrderEffects.includes(e));
          if (nextEffect) secondOrderEffects = [...secondOrderEffects, nextEffect];
        }

        if (type === 'evidence' && synthesis.missing.length > 0) {
          const [resolved, ...remainingMissing] = synthesis.missing;
          synthesis = {
            ...synthesis,
            missing: remainingMissing,
            wellSupported: [
              ...synthesis.wellSupported,
              `Follow-up investigation addressed this: ${resolved}`,
            ],
          };
        }

        return {
          ...i,
          status: 'ready',
          critique,
          systemsView,
          secondOrderEffects,
          synthesis,
          rounds: [...i.rounds, { id: roundId, type, note, response, timestamp: new Date().toISOString() }],
        };
      });

      const agentId: AgentId = type === 'challenge' ? 'reviewer' : type === 'evidence' ? 'research' : 'planner';
      logEvent({
        agentId,
        type: 'task-completed',
        summary: `Responded to your ${type === 'challenge' ? 'challenge' : type === 'deeper' ? 'request to go deeper' : 'request for more evidence'} on "${shortTitle(
          inquiries.find(i => i.id === id)?.proposition ?? '',
        )}"`,
        relatedInquiryId: id,
      });
    }, 7000);
  }

  function handleChallenge(id: string, note: string) {
    logEvent({
      agentId: 'reviewer',
      type: 'human-decision',
      summary: `Human challenged the synthesis for "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'challenge', note);
  }

  function handleGoDeeper(id: string, note?: string) {
    logEvent({
      agentId: 'planner',
      type: 'human-decision',
      summary: `Human asked for deeper investigation on "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'deeper', note ?? '');
  }

  function handleAskForEvidence(id: string, note?: string) {
    logEvent({
      agentId: 'research',
      type: 'human-decision',
      summary: `Human asked for more evidence on "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'evidence', note ?? '');
  }

  function handleReviseProposition(proposition: string) {
    setRevisionSeed(proposition);
    setInquiryDialogOpen(true);
  }

  // Any decision seeded as already "info-requested" also gets its follow-up
  // scheduled once, so the loop closes even if the human never touches it.
  useEffect(() => {
    for (const decision of initialDecisions) {
      if (decision.status === 'info-requested') scheduleFollowUp(decision.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeQueueCount = decisions.filter(
    d => d.status === 'pending' || d.status === 'info-requested',
  ).length;
  const disagreementCount = decisions.filter(
    d => d.disagreement && (d.status === 'pending' || d.status === 'info-requested'),
  ).length;
  const inquiryCount = inquiries.filter(i => i.status === 'ready').length;

  return (
    <div className="bg-surface-base flex h-screen w-full overflow-hidden">
      <NavRail
        active={view}
        onSelect={setView}
        queueCount={activeQueueCount}
        disagreementCount={disagreementCount}
        inquiryCount={inquiryCount}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {view === 'overview' && (
          <OverviewView
            agents={agents}
            decisions={decisions}
            inquiries={inquiries}
            activity={activity}
            onOpenDecision={id => openDecision(id, 'queue')}
            onOpenInquiry={openInquiry}
            onGoToActivity={() => setView('activity')}
            onStartInquiry={() => {
              setRevisionSeed(undefined);
              setInquiryDialogOpen(true);
            }}
          />
        )}
        {view === 'inquiries' && (
          <InquiriesView
            inquiries={inquiries}
            selectedId={selectedInquiryId}
            onSelect={setSelectedInquiryId}
            onAccept={handleAccept}
            onChallenge={handleChallenge}
            onGoDeeper={handleGoDeeper}
            onAskForEvidence={handleAskForEvidence}
            onReviseProposition={handleReviseProposition}
          />
        )}
        {view === 'queue' && (
          <QueueView
            decisions={decisions}
            selectedId={selectedDecisionId}
            onSelect={setSelectedDecisionId}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestInfo={handleRequestInfo}
            onSideWith={handleSideWith}
          />
        )}
        {view === 'activity' && (
          <ActivityView
            activity={activity}
            onOpenDecision={id => openDecision(id, 'queue')}
            onOpenInquiry={openInquiry}
          />
        )}
        {view === 'audit' && (
          <AuditView
            decisions={decisions}
            inquiries={inquiries}
            selectedId={selectedDecisionId ?? selectedInquiryId}
            onSelect={id => {
              setSelectedDecisionId(id);
              setSelectedInquiryId(id);
            }}
          />
        )}
      </main>

      <StartInquiryDialog
        open={inquiryDialogOpen}
        onOpenChange={setInquiryDialogOpen}
        onSubmit={handleStartInquiry}
        initialProposition={revisionSeed}
      />
    </div>
  );
}
