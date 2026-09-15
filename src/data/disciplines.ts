export interface DisciplineDef {
  name: string;
  keywords: string[];
  relevance: string;
  contribution: string;
}

// A candidate catalog of bodies of knowledge. Which ones surface for a given
// proposition is decided by keyword match against the submitted text (see
// lib/inquiryGenerator.ts) — this is a simulation of "identify relevant
// disciplines," not real domain reasoning.
export const disciplineCatalog: DisciplineDef[] = [
  {
    name: 'Agentic AI & AI systems',
    keywords: ['ai', 'agent', 'agents', 'agentic', 'automation', 'autonomous', 'model', 'llm', 'algorithm'],
    relevance:
      'The proposition rests on what AI agents can reliably do today and where they still fall short.',
    contribution:
      'Current agentic systems execute well-bounded tasks capably, but struggle with judgement under ambiguity, long-horizon planning, and taking accountability for outcomes.',
  },
  {
    name: 'Organisation design',
    keywords: ['organisation', 'organization', 'team', 'structure', 'hierarchy', 'roles', 'department', 'company', 'firm'],
    relevance:
      'Any redistribution of work between humans and agents is, first, a question of how an organisation is structured.',
    contribution:
      'Organisation design asks who holds decision rights, how work is coordinated across boundaries, and what structure keeps accountability legible rather than diffuse.',
  },
  {
    name: 'Strategy',
    keywords: ['strategy', 'strategic', 'competitive', 'advantage', 'direction', 'vision', 'planning'],
    relevance:
      'The proposition touches on where strategic judgement sits, which is a core strategy question.',
    contribution:
      'Strategy distinguishes execution — doing things right — from direction-setting — deciding which things to do at all. The proposition partly assumes this split and partly tests it.',
  },
  {
    name: 'Economics',
    keywords: ['economic', 'economics', 'cost', 'efficiency', 'market', 'price', 'value', 'roi', 'budget', 'resource'],
    relevance: 'Redistributing work has direct cost, productivity, and labour-market implications.',
    contribution:
      'Economics would weigh the marginal cost of agent labour against human labour, the transition cost of getting there, and who actually captures the resulting productivity gain.',
  },
  {
    name: 'Human factors',
    keywords: ['human', 'humans', 'people', 'trust', 'judgement', 'judgment', 'psychology', 'behaviour', 'behavior', 'cognitive'],
    relevance:
      'The proposition makes claims about what humans are for, which is a human-factors question as much as a technical one.',
    contribution:
      'Human-factors research shows people struggle to maintain effective oversight of systems that are usually right — supervisory attention tends to degrade exactly when it is most needed.',
  },
  {
    name: 'Service & systems design',
    keywords: ['service', 'system', 'systems', 'process', 'workflow', 'experience', 'journey', 'design', 'execution'],
    relevance: 'Reworking how work flows through an organisation is, structurally, a systems design problem.',
    contribution:
      'Systems design traces how a decision actually moves end to end, and where handoffs between human and agent create latency, ambiguity, or information loss.',
  },
  {
    name: 'Governance',
    keywords: ['governance', 'accountability', 'oversight', 'control', 'compliance', 'regulation', 'policy', 'audit'],
    relevance: 'Any shift in who does the work raises the question of who remains answerable for what.',
    contribution:
      'Governance frameworks require a clear, named owner for every material decision — diffusing execution across agents doesn’t remove the need for one.',
  },
  {
    name: 'Management theory',
    keywords: ['management', 'manage', 'leadership', 'delegate', 'delegation', 'supervise', 'supervision', 'planning'],
    relevance:
      'The proposition redefines what management means once much of the work is delegated to non-human agents.',
    contribution:
      'Classical management theory assumed the manager did, or closely oversaw, the work itself; delegation to agents pushes "directing" toward setting intent rather than giving instructions.',
  },
  {
    name: 'Technology & platforms',
    keywords: ['technology', 'platform', 'infrastructure', 'tooling', 'software', 'integration', 'api'],
    relevance: 'The proposition depends on what the underlying technology can actually support at scale.',
    contribution:
      'A platform lens would ask whether the necessary integration, data access, and tooling exist yet, or whether the proposition assumes infrastructure that isn’t there.',
  },
  {
    name: 'Data & measurement',
    keywords: ['data', 'measurement', 'metric', 'evidence', 'evaluate', 'measure', 'kpi', 'benchmark'],
    relevance: 'Claims about what is "working" require a way to measure it — one the proposition doesn’t supply.',
    contribution:
      'Without a defined metric for what "handling" or "success" means here, it is hard to tell whether the proposed arrangement is actually working or just appears to be.',
  },
  {
    name: 'Law & liability',
    keywords: ['law', 'legal', 'liability', 'contract', 'regulation', 'rights'],
    relevance: 'Delegating execution to agents raises the question of who is liable when something goes wrong.',
    contribution:
      'Liability frameworks generally require a responsible legal person — an agent acting autonomously doesn’t remove the need to identify who answers for its actions.',
  },
  {
    name: 'Ethics',
    keywords: ['ethics', 'ethical', 'fairness', 'bias', 'transparency', 'moral'],
    relevance: 'Deciding which judgements agents are trusted with carries ethical weight, not just operational weight.',
    contribution:
      'An ethical lens asks whose interests are served by this division of labour, and whether the people affected by it can actually see the decisions being made on their behalf.',
  },
  {
    name: 'Change management',
    keywords: ['change', 'adoption', 'transition', 'transform', 'culture', 'resistance'],
    relevance: 'Moving work from humans to agents is an organisational change, with the adoption risk that implies.',
    contribution:
      'Change management would flag that the hard part is rarely the technology — it’s whether people actually trust, adopt, and reshape their own roles around the new arrangement.',
  },
  {
    name: 'Customer & market behaviour',
    keywords: ['customer', 'client', 'user', 'market', 'demand'],
    relevance: 'Where the work in question touches customers, their tolerance for agent-driven decisions matters.',
    contribution:
      'Market and customer research would ask whether the people affected actually accept an agent-driven process, independent of whether it is more efficient.',
  },
  {
    name: 'Risk & security',
    keywords: ['risk', 'security', 'safety', 'failure', 'resilience', 'threat'],
    relevance: 'Concentrating execution in autonomous systems changes the organisation’s risk profile.',
    contribution:
      'A risk lens asks what happens when the agents are wrong at scale and simultaneously, rather than one human making one mistake at a time.',
  },
  {
    name: 'Operations',
    keywords: ['operations', 'operational', 'supply chain', 'logistics', 'throughput'],
    relevance: 'The proposition is partly an operations question: what day-to-day execution actually looks like.',
    contribution:
      'Operations would focus on throughput, exception handling, and what happens on the days the process doesn’t go as planned.',
  },
];

// Used to pad the result up to a sensible minimum when few disciplines match
// directly — chosen because accountability and cost are relevant to nearly
// any organisational proposition, not because they were hand-picked for one.
export const defaultDisciplinePriority = [
  'Governance',
  'Economics',
  'Management theory',
  'Service & systems design',
  'Human factors',
  'Risk & security',
];
