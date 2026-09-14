import type { ChainStage, Decision, EvidenceItem } from '@/types/domain';

export interface WorkBriefInput {
  brief: string;
  context: string;
  desiredOutcome: string;
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function deriveTitle(brief: string): string {
  const firstLine = brief.split(/\n|(?<=[.?!])\s/)[0]?.trim() || brief.trim();
  return truncate(firstLine, 72) || 'Untitled work item';
}

// Deterministic so the same brief always reads the same way in a session,
// but varied enough across briefs to feel like a real (if mocked) judgement.
function pseudoConfidence(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const band = 0.55 + (hash % 24) / 100; // 0.55–0.78, always below auto-approve
  return Math.round(band * 100) / 100;
}

export function buildWorkDecision(id: string, input: WorkBriefInput): Decision {
  const title = deriveTitle(input.brief);
  const confidence = pseudoConfidence(input.brief + input.context);
  const briefSnippet = truncate(input.brief, 260);
  const contextSnippet = input.context
    ? truncate(input.context, 220)
    : 'No additional context was provided.';
  const outcomeSnippet = input.desiredOutcome
    ? truncate(input.desiredOutcome, 220)
    : 'No specific outcome was described — Planner Agent worked from the brief alone.';

  const evidence: EvidenceItem[] = [
    {
      label: 'Brief, as submitted',
      detail: briefSnippet,
      source: 'You, via Start new work',
    },
    {
      label: 'Context provided',
      detail: contextSnippet,
      source: 'You, via Start new work',
    },
    {
      label: 'Precedent check',
      detail:
        'No existing work item or policy matches this request closely enough to resolve it automatically.',
      source: 'Research Agent',
    },
  ];

  const chain: ChainStage[] = [
    {
      id: 'history',
      title: 'Background',
      summary: 'No related prior work item exists for this brief.',
      confidence: 0.9,
      details: [
        {
          label: 'Precedent search',
          detail: 'Planner Agent found no matching prior work item to reuse or adapt.',
          source: 'Planner Agent',
        },
      ],
    },
    {
      id: 'knowledge',
      title: 'Knowledge gathered',
      summary: 'Research Agent worked from the context you provided.',
      confidence,
      details: [
        {
          label: 'Context supplied',
          detail: contextSnippet,
          source: 'You, via Start new work',
        },
      ],
    },
    {
      id: 'policy-match',
      title: 'Policy matched',
      summary: 'No existing policy covers this kind of request yet.',
      confidence: 0.99,
      flagged: true,
      details: [
        {
          label: 'Policy search',
          detail: 'Reviewer Agent checked the policy library and found no matching entry.',
          source: 'Reviewer Agent',
        },
      ],
    },
    {
      id: 'reasoning',
      title: 'Agent reasoning',
      summary: `Planner Agent proposed an approach aimed at: ${outcomeSnippet}`,
      confidence,
      details: [
        {
          label: 'Target outcome',
          detail: outcomeSnippet,
          source: 'You, via Start new work',
        },
      ],
    },
    {
      id: 'recommendation',
      title: 'Recommendation',
      summary: 'Proceed with the proposed approach, pending your judgement.',
      confidence,
      details: [
        {
          label: 'Proposed action',
          detail: `Proceed with a plan aimed at: ${outcomeSnippet}`,
          source: 'Planner Agent',
        },
      ],
    },
  ];

  return {
    id,
    category: 'custom-work',
    title,
    status: 'investigating',
    createdAt: new Date().toISOString(),
    summary: `Planner Agent proposes an approach for "${title}", checked by Research and Reviewer Agents.`,
    whatHappened: `You asked the workbench to take this on: "${briefSnippet}"`,
    recommendation: {
      action: 'Proceed with the proposed approach',
      rationale: `Aimed at: ${outcomeSnippet}`,
    },
    confidence,
    requestingAgent: 'planner',
    involvedAgents: ['planner', 'research', 'reviewer'],
    evidence,
    policy: {
      name: 'No matching policy',
      excerpt:
        '"New work outside existing playbooks is escalated to a human before being marked complete."',
      matchConfidence: 1,
    },
    unusualFactors: [
      'This is a new kind of request — there is no existing policy or precedent for it yet.',
    ],
    escalationReason:
      'This doesn’t match any existing policy, so Reviewer Agent routed it to you rather than resolving it automatically.',
    chain,
  };
}
