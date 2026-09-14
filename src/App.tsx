import { useEffect, useRef, useState } from 'react';

import { NavRail } from '@/components/layout/NavRail';
import { agents as initialAgents } from '@/data/agents';
import { initialActivity } from '@/data/activity';
import { initialDecisions } from '@/data/decisions';
import { minutesAgo } from '@/lib/time';
import { ActivityView } from '@/views/ActivityView';
import { AuditView } from '@/views/AuditView';
import { OverviewView } from '@/views/OverviewView';
import { QueueView } from '@/views/QueueView';
import type { ActivityEvent, AgentId, Decision } from '@/types/domain';

export type View = 'overview' | 'queue' | 'activity' | 'audit';

let eventCounter = 0;
function nextEventId() {
  eventCounter += 1;
  return `evt-${Date.now()}-${eventCounter}`;
}

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null,
  );
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [activity, setActivity] = useState<ActivityEvent[]>(initialActivity);
  const scheduled = useRef(new Set<string>());

  const agents = initialAgents;

  function logEvent(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    setActivity(prev => [{ ...event, id: nextEventId(), timestamp: new Date().toISOString() }, ...prev]);
  }

  function openDecision(id: string, target: View = 'queue') {
    setSelectedDecisionId(id);
    setView(target);
  }

  function updateDecision(id: string, updater: (d: Decision) => Decision) {
    setDecisions(prev => prev.map(d => (d.id === id ? updater(d) : d)));
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

  return (
    <div className="bg-surface-base flex h-screen w-full overflow-hidden">
      <NavRail
        active={view}
        onSelect={setView}
        queueCount={activeQueueCount}
        disagreementCount={disagreementCount}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {view === 'overview' && (
          <OverviewView
            agents={agents}
            decisions={decisions}
            activity={activity}
            onOpenDecision={id => openDecision(id, 'queue')}
            onGoToActivity={() => setView('activity')}
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
          />
        )}
        {view === 'audit' && (
          <AuditView
            decisions={decisions}
            selectedId={selectedDecisionId}
            onSelect={setSelectedDecisionId}
          />
        )}
      </main>
    </div>
  );
}
