export type AgentId = 'planner' | 'research' | 'reviewer';

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
  | 'human-decision';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agentId: AgentId;
  type: ActivityEventType;
  summary: string;
  detail?: string;
  relatedInquiryId?: string;
  involvedAgentId?: AgentId;
}

// --- Inquiry: an idea, proposition or question submitted for Heph to
// interpret, ground in relevant knowledge, and challenge. ---

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
