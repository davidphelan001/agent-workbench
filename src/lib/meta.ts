import type { ActivityEventType, AgentId, AgentStatus, InquiryStatus } from '@/types/domain';

export const agentIcon: Record<AgentId, string> = {
  planner: 'timeline',
  research: 'travel_explore',
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

export const inquiryIcon = 'psychology';

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  investigating: 'Being investigated',
  ready: 'Ready for you',
  revising: 'Reconsidering',
  accepted: 'Accepted',
};

export const activityIcon: Record<ActivityEventType, string> = {
  'task-started': 'play_arrow',
  'task-completed': 'check_circle',
  'agent-requested': 'call_split',
  uncertainty: 'help',
  escalated: 'priority_high',
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
  'human-decision': 'custom',
};
