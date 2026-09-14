import { useState } from 'react';

import { NavRail } from '@/components/layout/NavRail';
import { StartInquiryDialog } from '@/components/workbench/StartInquiryDialog';
import { agents as initialAgents } from '@/data/agents';
import { initialActivity } from '@/data/activity';
import { initialInquiries } from '@/data/seedInquiries';
import {
  buildInquiry,
  buildRound,
  FAILURE_MODE_POOL,
  SECOND_ORDER_POOL,
  SYSTEMS_DIMENSIONS,
  type InquiryInput,
} from '@/lib/inquiryGenerator';
import { ActivityView } from '@/views/ActivityView';
import { IdeaListView } from '@/views/IdeaListView';
import { IdeasView } from '@/views/IdeasView';
import { OverviewView } from '@/views/OverviewView';
import type { ActivityEvent, Agent, AgentId, Inquiry } from '@/types/domain';

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
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [activity, setActivity] = useState<ActivityEvent[]>(initialActivity);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [revisionSeed, setRevisionSeed] = useState<string | undefined>(undefined);

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

  function openInquiry(id: string) {
    setSelectedInquiryId(id);
    setView('inquiries');
  }

  function updateInquiry(id: string, updater: (i: Inquiry) => Inquiry) {
    setInquiries(prev => prev.map(i => (i.id === id ? updater(i) : i)));
  }

  // Submit an idea. Builds the full interpretation/disciplines/critique/
  // systems/synthesis content up front (status "investigating"), then reveals
  // it in stages through Heph's activity so it reads as the work actually
  // happening — Planner interprets and later synthesises, Research surfaces
  // relevant disciplines, Reviewer critiques and widens the lens — before the
  // idea becomes "ready" for your critique.
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
        summary: `Decomposed the idea — surfaced ${inquiry.interpretation.assumptions.length} assumptions and ${inquiry.interpretation.ambiguities.length} open ambiguities`,
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
        summary: `Challenged the idea — found ${inquiry.critique.contradictions.length + inquiry.critique.weakAssumptions.length} points of friction`,
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
        summary: 'Synthesised perspectives into a strengthened framing — ready for your critique',
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
      summary: `accepted the synthesis for "${shortTitle(inquiry.proposition)}"`,
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
      summary: `challenged the synthesis for "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'challenge', note);
  }

  function handleGoDeeper(id: string, note?: string) {
    logEvent({
      agentId: 'planner',
      type: 'human-decision',
      summary: `asked for deeper investigation on "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'deeper', note ?? '');
  }

  function handleAskForEvidence(id: string, note?: string) {
    logEvent({
      agentId: 'research',
      type: 'human-decision',
      summary: `asked for more evidence on "${shortTitle(inquiries.find(i => i.id === id)?.proposition ?? '')}"`,
      detail: note,
      relatedInquiryId: id,
    });
    scheduleInquiryRound(id, 'evidence', note ?? '');
  }

  function handleReviseProposition(proposition: string) {
    setRevisionSeed(proposition);
    setInquiryDialogOpen(true);
  }

  const critCount = inquiries.filter(i => i.status === 'ready').length;

  return (
    <div className="bg-surface-base flex h-screen w-full overflow-hidden">
      <NavRail
        active={view}
        onSelect={setView}
        ideaCount={inquiries.length}
        critCount={critCount}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {view === 'overview' && (
          <OverviewView
            agents={agents}
            inquiries={inquiries}
            activity={activity}
            onOpenInquiry={openInquiry}
            onGoToActivity={() => setView('activity')}
            onStartInquiry={() => {
              setRevisionSeed(undefined);
              setInquiryDialogOpen(true);
            }}
          />
        )}
        {view === 'inquiries' && (
          <IdeasView
            inquiries={inquiries}
            selectedId={selectedInquiryId}
            onSelect={setSelectedInquiryId}
            onStartInquiry={() => {
              setRevisionSeed(undefined);
              setInquiryDialogOpen(true);
            }}
            onAccept={handleAccept}
            onChallenge={handleChallenge}
            onGoDeeper={handleGoDeeper}
            onAskForEvidence={handleAskForEvidence}
            onReviseProposition={handleReviseProposition}
          />
        )}
        {view === 'queue' && (
          <IdeaListView
            scope="crit"
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
        {view === 'activity' && (
          <ActivityView activity={activity} onOpenInquiry={openInquiry} />
        )}
        {view === 'audit' && (
          <IdeaListView
            scope="history"
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
