import { defaultDisciplinePriority, disciplineCatalog } from '@/data/disciplines';
import type {
  Critique,
  DisciplinePerspective,
  Inquiry,
  Interpretation,
  Reframe,
  Synthesis,
  SystemsObservation,
} from '@/types/domain';

export interface InquiryInput {
  proposition: string;
  context: string;
}

function normalize(text: string): string {
  return text.toLowerCase();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some(n => haystack.includes(n));
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

// --- Disciplines -----------------------------------------------------------

function selectDisciplines(text: string): DisciplinePerspective[] {
  const lower = normalize(text);

  const scored = disciplineCatalog
    .map(d => ({
      def: d,
      score: d.keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  let selected = scored.map(s => s.def);

  if (selected.length < 4) {
    for (const name of defaultDisciplinePriority) {
      if (selected.length >= 4) break;
      if (selected.some(d => d.name === name)) continue;
      const def = disciplineCatalog.find(d => d.name === name);
      if (def) selected.push(def);
    }
  }

  selected = selected.slice(0, 6);

  return selected.map(d => ({
    name: d.name,
    relevance: d.relevance,
    contribution: d.contribution,
  }));
}

// --- Interpretation ----------------------------------------------------------

function extractCoreClaim(proposition: string): string {
  const stripped = proposition
    .trim()
    .replace(/[?.]+$/, '')
    .replace(/^(explore whether|investigate whether|consider whether|whether|can|could|should|does|is|are)\s+/i, '');
  const lower = stripped.charAt(0).toLowerCase() + stripped.slice(1);
  return `As framed, the proposition claims that ${lower}.`;
}

const ASSUMPTION_RULES: { keywords: string[]; text: string }[] = [
  {
    keywords: ['agent', 'agents', 'ai', 'automat'],
    text: 'That AI agents can operate reliably enough, across enough situations, to be trusted with the work described.',
  },
  {
    keywords: ['strategic', 'judgement', 'judgment'],
    text: 'That "judgement" is a distinct, separable activity from the planning and execution that would be delegated.',
  },
  {
    keywords: ['organisation', 'organization', 'structure', 'team'],
    text: 'That organisational structure can be redrawn around this division of labour without disrupting how accountability currently works.',
  },
  {
    keywords: ['human', 'humans', 'people'],
    text: 'That the humans involved want to retain the role being described for them, rather than experiencing it as displacement.',
  },
  {
    keywords: ['plan', 'planning'],
    text: 'That planning can be executed well without the tacit context a human planner currently holds.',
  },
  {
    keywords: ['research'],
    text: 'That agent-performed "research" produces knowledge of comparable quality to human research, not just comparable volume.',
  },
  {
    keywords: ['execution', 'execute'],
    text: 'That execution quality is mainly a function of capability, rather than of the accountability that comes with a human executing.',
  },
  {
    keywords: ['cost', 'efficien', 'budget'],
    text: 'That the efficiency gains being sought outweigh the transition and ongoing oversight costs of the new arrangement.',
  },
  {
    keywords: ['trust', 'confidence'],
    text: 'That trust in the new arrangement can be established before it is relied upon, not only after something goes wrong.',
  },
];

const GENERIC_ASSUMPTIONS = [
  'That the proposition, as stated, is asking the right question rather than standing in for a different one.',
  'That success or failure here would be visible and attributable, rather than diffuse and hard to trace.',
];

function selectByRules(text: string, rules: { keywords: string[]; text: string }[], min: number, max: number, fallback: string[]): string[] {
  const lower = normalize(text);
  const matched = rules.filter(r => includesAny(lower, r.keywords)).map(r => r.text);
  const result = [...matched];
  for (const f of fallback) {
    if (result.length >= min) break;
    if (!result.includes(f)) result.push(f);
  }
  return pick(result, max);
}

const AMBIGUITY_RULES: { keywords: string[]; text: string }[] = [
  {
    keywords: ['most'],
    text: '"Most" is doing a lot of work here — does it mean most by task count, most by time spent, or most by value at stake?',
  },
  {
    keywords: ['strategic', 'judgement', 'judgment'],
    text: '"Judgement" isn’t defined — is it decision authority, values-setting, risk appetite, or something else entirely?',
  },
  {
    keywords: ['handle'],
    text: '"Handle" could mean execute, be accountable for, or have final say over — these are materially different claims.',
  },
  {
    keywords: ['retain'],
    text: '"Retain" implies humans currently hold this exclusively — is that actually true today, or partly aspirational?',
  },
];

const GENERIC_AMBIGUITIES = [
  'No timeframe is stated — a near-term pilot and a permanent structural claim are different propositions.',
  'The proposition doesn’t say what would count as evidence that this is, or isn’t, working.',
];

const CONCEPT_RULES: { keywords: string[]; term: string; note: string }[] = [
  {
    keywords: ['strategic', 'judgement', 'judgment'],
    term: 'Strategic judgement',
    note: 'What decisions this actually covers, and how it differs from operational judgement.',
  },
  {
    keywords: ['organisation', 'organization'],
    term: 'The organisation',
    note: 'Whether this means a whole company, a single function, or one team.',
  },
  {
    keywords: ['agent', 'agents', 'ai'],
    term: 'AI agents',
    note: 'What capability level is assumed — today’s systems, or a projected future one.',
  },
  {
    keywords: ['execution'],
    term: 'Execution',
    note: 'Whether this includes irreversible actions like spending and commitments, or only reversible ones.',
  },
  {
    keywords: ['planning'],
    term: 'Planning',
    note: 'Whether this is tactical scheduling or the kind of planning that sets direction.',
  },
];

function buildInterpretation(proposition: string, context: string): Interpretation {
  const text = `${proposition} ${context}`;
  const coreClaim = extractCoreClaim(proposition);
  const assumptions = selectByRules(text, ASSUMPTION_RULES, 3, 5, GENERIC_ASSUMPTIONS);
  const ambiguities = selectByRules(text, AMBIGUITY_RULES, 2, 4, GENERIC_AMBIGUITIES);

  const lower = normalize(text);
  const concepts = CONCEPT_RULES.filter(c => includesAny(lower, c.keywords)).map(c => ({
    term: c.term,
    note: c.note,
  }));

  const subject = includesAny(lower, ['agent', 'agents', 'ai']) ? 'AI agents' : 'the proposed system';
  const alternativeReadings = [
    `A narrower reading: ${subject} handle execution and groundwork, with humans reviewing before anything consequential is committed.`,
    'A broader reading: this isn’t really about task allocation — it’s about redesigning the organisation so that human judgement becomes the only deliberate bottleneck left.',
  ];

  return {
    coreClaim,
    assumptions,
    ambiguities,
    conceptsToDefine: concepts.length > 0
      ? concepts
      : [{ term: 'The proposal itself', note: 'What would need to be true for this to count as settled, one way or the other.' }],
    alternativeReadings,
  };
}

// --- Critique ----------------------------------------------------------------

const WEAK_ASSUMPTION_RULES = [
  {
    keywords: ['agent', 'agents', 'ai'],
    text: 'The proposition treats agent capability as fixed, when it is currently the fastest-moving variable in this entire question.',
  },
  {
    keywords: ['strategic'],
    text: '"Strategic" work is assumed to be inherently harder for agents than "operational" work — but some strategic calls are simple, and some operational ones are highly judgement-heavy.',
  },
  {
    keywords: ['most'],
    text: 'Claiming agents handle "most" of the work says nothing about whether they handle the parts that matter most.',
  },
  {
    keywords: ['retain'],
    text: 'Humans "retaining" a role is not the same as humans being equipped, motivated, and positioned to perform it well.',
  },
];

const CONTRADICTION_RULES = [
  {
    keywords: ['autonomous', 'execution'],
    text: 'If execution is genuinely autonomous, that is hard to reconcile with humans retaining meaningful real-time judgement over it — judgement applied after the fact is a weaker, different claim.',
  },
  {
    keywords: ['strategic', 'judgement', 'judgment', 'planning'],
    text: 'Retaining "judgement" while agents handle "planning" is in tension: much strategic judgement is exercised during planning itself, not only at the point of final sign-off.',
  },
];

const GENERIC_CONTRADICTION =
  'The proposition doesn’t reconcile its own scope: delegating "most" of the work implies a small human role, while retaining the most consequential judgement implies the human role is actually the important one — both can be true, but the proposition doesn’t say how they fit together.';

const MISSING_EVIDENCE_POOL = [
  'No comparison is offered against organisations that have actually tried a version of this.',
  'There’s no proposed way to measure whether judgement is being exercised well, versus simply retained in name.',
  'The proposition doesn’t address what happens when agent-produced work and human judgement disagree.',
  'No failure case is described — what this looks like when it goes wrong is left unstated.',
];

const ALTERNATIVE_INTERPRETATION_POOL = [
  'This may be less a claim about agent capability and more a claim about wanting to reduce cost or headcount — worth separating the two motivations.',
  'The proposition could be read as really asking "what is left for humans to do," which is a different, perhaps more honest, question than the one stated.',
];

export const FAILURE_MODE_POOL = [
  'Agents optimise against the metrics they’re given — where those metrics don’t fully capture intent, execution quietly drifts from it.',
  'Humans asked only to exercise judgement, without doing the underlying work, tend to lose the context needed to judge well — a known failure mode in delegated oversight.',
  'What starts as temporary agent latitude, granted during a busy period, tends to become permanent by default because no one revisits it.',
  'Early success stories get retold as the norm, quietly raising the bar for what counts as an acceptable failure rate later on.',
];

const FRAMING_ISSUE_POOL = [
  'This is framed as a binary — agents or humans — when the more useful question may be which specific decisions need which kind of judgement.',
  'Framing this around "most of the work" measures effort, not risk — a small share of decisions usually carries most of the consequence.',
];

function buildCritique(proposition: string, context: string): Critique {
  const text = `${proposition} ${context}`;
  const lower = normalize(text);

  const weakAssumptions = selectByRules(text, WEAK_ASSUMPTION_RULES, 2, 3, [
    'A central term in the proposition is used as though everyone would define it the same way.',
  ]);

  const matchedContradictions = CONTRADICTION_RULES.filter(r => includesAny(lower, r.keywords)).map(r => r.text);
  const contradictions = matchedContradictions.length > 0
    ? pick(matchedContradictions, 2)
    : [GENERIC_CONTRADICTION];

  return {
    weakAssumptions,
    contradictions,
    missingEvidence: pick(MISSING_EVIDENCE_POOL, 3),
    alternativeInterpretations: pick(ALTERNATIVE_INTERPRETATION_POOL, 2),
    failureModes: pick(FAILURE_MODE_POOL, 2),
    framingIssues: pick(FRAMING_ISSUE_POOL, 2),
  };
}

// --- Systems view --------------------------------------------------------------

export const SYSTEMS_DIMENSIONS: SystemsObservation[] = [
  {
    dimension: 'Technology',
    observation:
      'Technical feasibility here shifts month to month — a proposition framed today may already look conservative, or premature, in six months.',
  },
  {
    dimension: 'Organisation',
    observation:
      'Even a successful version of this changes what career paths and expertise-building look like inside the organisation, not just its output.',
  },
  {
    dimension: 'People',
    observation:
      'People whose day-to-day work moves to agents will experience this as a loss of role, even where the organisation frames it as a reallocation.',
  },
  {
    dimension: 'Economics',
    observation:
      'The savings promised here are usually front-loaded in the narrative and back-loaded in reality — oversight and exception-handling costs tend to surface only after rollout.',
  },
  {
    dimension: 'Governance',
    observation:
      'Someone has to remain accountable when agent-driven work goes wrong. The proposition, as stated, is silent on who that is.',
  },
  {
    dimension: 'Experience',
    observation:
      'The people ultimately affected by these decisions may notice a shift in tone or consistency, even if no one tells them anything changed.',
  },
];

export const SECOND_ORDER_POOL = [
  'If this works well, expect pressure to extend it further than originally scoped — success tends to erode the boundaries meant to contain it.',
  'Skills the organisation stops practising day to day degrade quietly, and are expensive to rebuild if the arrangement ever needs to be reversed.',
  'Other parts of the organisation may start deferring to whatever agents produce, even in areas this was never intended to cover.',
  'The people this was meant to free up for higher-value work often find that work was never clearly defined either.',
];

// --- Synthesis & reframe -------------------------------------------------------

function buildSynthesis(critique: Critique, interpretation: Interpretation, disciplines: DisciplinePerspective[]): Synthesis {
  const wellSupported = [
    `${disciplines[0]?.name ?? 'The relevant literature'} broadly supports that parts of this are already happening in practice, not just in theory.`,
    'Clear separation of roles, where it can genuinely be achieved, does reduce ambiguity about who is accountable for what.',
  ];

  const uncertain = [
    interpretation.ambiguities[0] ?? 'Key terms in the proposition are not yet defined precisely enough to evaluate.',
    'Whether the proposed division of labour holds up under pressure, rather than only in routine conditions.',
  ];

  const contested = pick(critique.contradictions, 2);
  const missing = pick(critique.missingEvidence, 2);

  const whatChanged =
    `The original proposition poses this as a question of how much work agents can take on. Read closely, the harder question underneath it is where judgement is actually exercised — much of it happens during the work itself, not only at a final approval step. The reframing below tries to locate that more precisely, rather than treating "judgement" as a single retained category.`;

  return { wellSupported, uncertain, contested, missing, whatChanged };
}

function buildReframe(proposition: string): Reframe {
  const lower = normalize(proposition);
  const hasAgents = includesAny(lower, ['agent', 'agents', 'ai']);
  const hasJudgement = includesAny(lower, ['strategic', 'judgement', 'judgment']);

  const subjectPhrase = hasAgents ? 'AI agents' : 'The proposed system';

  const scopeWords = ['research', 'planning', 'execution', 'analysis', 'operations'].filter(w => lower.includes(w));
  const scopePhrase = scopeWords.length > 0 ? scopeWords.join(', ') : 'day-to-day execution';

  const refinedRolePhrase = hasJudgement
    ? 'intent, values, accountability, and the authority to change direction'
    : 'the authority to set intent and change direction, even without doing the underlying work';

  const strengthened =
    `${subjectPhrase} increasingly handle ${scopePhrase}, while humans retain ${refinedRolePhrase} — not just a final sign-off, but the standing ability to redefine the boundaries of that delegation at any point.`;

  const rationale =
    'This keeps the proposition’s core intuition but separates doing the work from holding authority over it — a distinction the original framing runs together. It also makes the human role something ongoing and structural, rather than a single checkpoint that erodes under pressure.';

  return {
    original: proposition.trim(),
    strengthened,
    rationale,
  };
}

// --- Public API ----------------------------------------------------------------

export function buildInquiry(id: string, input: InquiryInput): Inquiry {
  const { proposition, context } = input;
  const combinedText = `${proposition} ${context}`;

  const interpretation = buildInterpretation(proposition, context);
  const disciplines = selectDisciplines(combinedText);
  const critique = buildCritique(proposition, context);
  const systemsView = pick(SYSTEMS_DIMENSIONS, 5);
  const secondOrderEffects = pick(SECOND_ORDER_POOL, 3);
  const synthesis = buildSynthesis(critique, interpretation, disciplines);
  const reframe = buildReframe(proposition);

  return {
    id,
    proposition: proposition.trim(),
    context: context.trim() || undefined,
    status: 'investigating',
    createdAt: new Date().toISOString(),
    interpretation,
    disciplines,
    critique,
    systemsView,
    secondOrderEffects,
    synthesis,
    reframe,
    rounds: [],
  };
}

// Follow-up content used when the human challenges, asks to go deeper, or
// asks for more evidence — appends visibly to the relevant section rather
// than silently regenerating everything.
export function buildRound(
  type: 'challenge' | 'deeper' | 'evidence',
  _note: string,
): { response: string } {
  if (type === 'challenge') {
    return {
      response:
        'Reviewed against your challenge: the synthesis stands on its central point, but the framing has been sharpened — see the updated "contested" and "uncertain" items below.',
    };
  }
  if (type === 'deeper') {
    return {
      response:
        'Went a level deeper on the weakest parts of the critique and systems view — new findings are appended below rather than replacing what was already there.',
    };
  }
  return {
    response:
      'Gathered additional evidence against the specific gap you flagged — see the new items added to the evidence and systems view below.',
  };
}
