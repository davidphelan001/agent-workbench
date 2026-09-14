import type {
  ActivityEventType,
  AgentId,
  AgentStatus,
  DecisionCategory,
  DecisionStatus,
} from '@/types/domain';

export const agentIcon: Record<AgentId, string> = {
  planner: 'timeline',
  research: 'travel_explore',
  customer: 'support_agent',
  operations: 'conveyor_belt',
  reviewer: 'fact_check',
};

export const statusDotVariant: Record<
  AgentStatus,
  'success' | 'warning' | 'error' | 'neutral'
> = {
  working: 'success',
  idle: 'neutral',
  uncertain: 'warning',
  blocked: 'error',
};

export const statusLabel: Record<AgentStatus, string> = {
  working: 'Working',
  idle: 'Idle',
  uncertain: 'Uncertain',
  blocked: 'Blocked',
};

export const categoryLabel: Record<DecisionCategory, string> = {
  compensation: 'Compensation',
  'refund-dispute': 'Refund dispute',
  'policy-exception': 'Policy exception',
  escalation: 'Escalation',
  'custom-work': 'Commissioned work',
};

export const categoryIcon: Record<DecisionCategory, string> = {
  compensation: 'payments',
  'refund-dispute': 'balance',
  'policy-exception': 'policy',
  escalation: 'priority_high',
  'custom-work': 'edit_note',
};

export const decisionStatusLabel: Record<DecisionStatus, string> = {
  pending: 'Needs judgement',
  'info-requested': 'Awaiting more information',
  investigating: 'Agents working on this',
  approved: 'Approved',
  rejected: 'Rejected',
  'resolved-auto': 'Resolved autonomously',
};

export const activityIcon: Record<ActivityEventType, string> = {
  'task-started': 'play_arrow',
  'task-completed': 'check_circle',
  'agent-requested': 'call_split',
  uncertainty: 'help',
  escalated: 'priority_high',
  disagreement: 'swap_horiz',
  'human-decision': 'person',
};

export const activityIconTone: Record<
  ActivityEventType,
  'neutral' | 'custom'
> = {
  'task-started': 'neutral',
  'task-completed': 'neutral',
  'agent-requested': 'neutral',
  uncertainty: 'custom',
  escalated: 'custom',
  disagreement: 'custom',
  'human-decision': 'custom',
};
