export type AgentId =
  | 'planner'
  | 'research'
  | 'customer'
  | 'operations'
  | 'reviewer';

export type AgentStatus = 'working' | 'idle' | 'uncertain' | 'blocked';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  tasksCompletedToday: number;
  tasksBlocked: number;
  initials: string;
}

export type ActivityEventType =
  | 'task-started'
  | 'task-completed'
  | 'agent-requested'
  | 'uncertainty'
  | 'escalated'
  | 'disagreement'
  | 'human-decision';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agentId: AgentId;
  type: ActivityEventType;
  summary: string;
  detail?: string;
  relatedDecisionId?: string;
  involvedAgentId?: AgentId;
}

export type DecisionCategory =
  | 'compensation'
  | 'refund-dispute'
  | 'policy-exception'
  | 'escalation';

export type DecisionStatus =
  | 'pending'
  | 'info-requested'
  | 'investigating'
  | 'approved'
  | 'rejected'
  | 'resolved-auto';

export interface EvidenceItem {
  label: string;
  detail: string;
  source: string;
}

export interface ChainStage {
  id: string;
  title: string;
  summary: string;
  details: EvidenceItem[];
  confidence?: number;
  flagged?: boolean;
}

export interface AgentPosition {
  agentId: AgentId;
  position: string;
  evidence: EvidenceItem[];
  confidence: number;
}

export interface Disagreement {
  positions: [AgentPosition, AgentPosition];
  pointOfDivergence: string;
  autoResolvable: boolean;
  reasonNotAutoResolved: string;
}

export interface HumanRecord {
  action: 'approved' | 'rejected' | 'sided-a' | 'sided-b' | 'requested-info';
  note?: string;
  timestamp: string;
  changedRecommendation: boolean;
}

export interface Decision {
  id: string;
  category: DecisionCategory;
  title: string;
  customer?: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt?: string;
  summary: string;
  whatHappened: string;
  recommendation: {
    action: string;
    amount?: string;
    rationale: string;
  };
  confidence: number;
  requestingAgent: AgentId;
  involvedAgents: AgentId[];
  evidence: EvidenceItem[];
  policy: {
    name: string;
    excerpt: string;
    matchConfidence: number;
  };
  unusualFactors: string[];
  escalationReason: string;
  chain: ChainStage[];
  disagreement?: Disagreement;
  humanRecord?: HumanRecord;
  infoRequestNote?: string;
}
