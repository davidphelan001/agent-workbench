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
  relatedInquiryId?: string;
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

// --- Inquiry: submitting a proposition for the organisation to interrogate,
// as opposed to a Decision (an operational action awaiting approval). ---

export type InquiryStatus = 'investigating' | 'ready' | 'revising' | 'accepted';

export interface DisciplinePerspective {
  name: string;
  relevance: string;
  contribution: string;
}

export interface Interpretation {
  coreClaim: string;
  assumptions: string[];
  ambiguities: string[];
  conceptsToDefine: { term: string; note: string }[];
  alternativeReadings: string[];
}

export interface Critique {
  weakAssumptions: string[];
  contradictions: string[];
  missingEvidence: string[];
  alternativeInterpretations: string[];
  failureModes: string[];
  framingIssues: string[];
}

export interface SystemsObservation {
  dimension: string;
  observation: string;
}

export interface Synthesis {
  wellSupported: string[];
  uncertain: string[];
  contested: string[];
  missing: string[];
  whatChanged: string;
}

export interface Reframe {
  original: string;
  strengthened: string;
  rationale: string;
}

export interface InquiryRound {
  id: string;
  type: 'challenge' | 'deeper' | 'evidence';
  note: string;
  response: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  proposition: string;
  context?: string;
  status: InquiryStatus;
  createdAt: string;
  resolvedAt?: string;
  interpretation: Interpretation;
  disciplines: DisciplinePerspective[];
  critique: Critique;
  systemsView: SystemsObservation[];
  secondOrderEffects: string[];
  synthesis: Synthesis;
  reframe: Reframe;
  rounds: InquiryRound[];
  humanRecord?: {
    action: 'accepted';
    note?: string;
    timestamp: string;
  };
}
