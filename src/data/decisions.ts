import { minutesAgo } from '@/lib/time';
import type { Decision } from '@/types/domain';

export const initialDecisions: Decision[] = [
  {
    id: 'dec-comp-180',
    category: 'compensation',
    title: 'Compensation request — order #48213',
    customer: 'Priya Nair',
    status: 'pending',
    createdAt: minutesAgo(12),
    summary:
      'Customer Agent recommends £180 goodwill compensation for a delayed, partially damaged order.',
    whatHappened:
      'Order #48213 arrived 9 days late. One of two items (a ceramic lamp) arrived with a cracked base. The customer contacted support twice and referenced a prior late delivery from six weeks ago.',
    recommendation: {
      action: 'Issue goodwill compensation',
      amount: '£180',
      rationale:
        'Standard delay compensation (£60) plus damaged-item replacement value (£95), rounded up to the next goodwill tier (£180) because this is the customer’s second service failure in six weeks.',
    },
    confidence: 0.72,
    requestingAgent: 'customer',
    involvedAgents: ['customer', 'research'],
    evidence: [
      {
        label: 'Delivery tracking',
        detail: 'Dispatched day 1, delivered day 10. SLA target: day 4.',
        source: 'Logistics system — carrier scan history',
      },
      {
        label: 'Damage report',
        detail:
          'Customer-submitted photo shows a hairline crack in the lamp base. Image classifier: 91% confidence genuine transit damage.',
        source: 'Support ticket #48213-2, attachment review',
      },
      {
        label: 'Account history',
        detail:
          'One prior late delivery (order #47810, 43 days ago), resolved with a £25 credit at the time.',
        source: 'Customer account timeline',
      },
    ],
    policy: {
      name: 'Goodwill Compensation Policy v3, §2.4',
      excerpt:
        '"Where a customer experiences a second qualifying service failure within 60 days, agents may apply the next compensation tier without additional approval, up to £200."',
      matchConfidence: 0.81,
    },
    unusualFactors: [
      'Requested tier (£180) is at the upper edge of what §2.4 permits without a human co-sign — the policy allows it, but it is close to the £200 ceiling.',
      'The prior credit six weeks ago was for a different failure type (late delivery only, no damage).',
    ],
    escalationReason:
      'Confidence is below the 0.85 auto-approval threshold because the compensation combines two failure types the policy tables don’t explicitly cover together, and the amount sits near the top of the tier.',
    chain: [
      {
        id: 'history',
        title: 'Customer history',
        summary:
          'One prior service failure in the last 60 days; otherwise a stable, low-contact account.',
        confidence: 0.95,
        details: [
          {
            label: 'Account age',
            detail: '3 years, 41 orders, 2 support contacts before this one.',
            source: 'Customer account record',
          },
          {
            label: 'Prior resolution',
            detail: '£25 credit issued for order #47810, accepted without follow-up.',
            source: 'Support ticket #47810-1',
          },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary:
          'Delivery and damage evidence both independently support a service failure.',
        confidence: 0.88,
        details: [
          {
            label: 'Carrier SLA breach',
            detail: '9 days late against a 4-day target — a 125% overrun.',
            source: 'Logistics system',
          },
          {
            label: 'Damage classifier',
            detail: '91% confidence the submitted photo shows transit damage, not pre-existing wear.',
            source: 'Vision review model, ticket attachment',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary:
          'Goodwill Compensation Policy v3, §2.4 permits a second-failure tier increase.',
        confidence: 0.81,
        flagged: true,
        details: [
          {
            label: 'Matched clause',
            detail: '§2.4 — second qualifying failure within 60 days.',
            source: 'Policy library',
          },
          {
            label: 'Gap',
            detail:
              'The policy table lists delay and damage compensation separately; it does not give a combined-failure formula, so the agent summed both tiers itself.',
            source: 'Policy library — table 2.4-A',
          },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary:
          'Customer Agent combined the delay and damage tiers, then rounded to the second-failure goodwill tier.',
        confidence: 0.72,
        details: [
          {
            label: 'Calculation',
            detail: '£60 (delay) + £95 (damaged item replacement) → rounded to £180 goodwill tier.',
            source: 'Customer Agent reasoning trace',
          },
          {
            label: 'Self-assessed uncertainty',
            detail:
              'Agent flagged combining two compensation types as outside its highest-confidence pattern.',
            source: 'Customer Agent confidence model',
          },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'Issue £180 goodwill compensation and a written apology.',
        confidence: 0.72,
        details: [
          {
            label: 'Proposed action',
            detail: 'Credit £180 to account, send apology referencing both issues.',
            source: 'Customer Agent',
          },
        ],
      },
    ],
  },
  {
    id: 'dec-refund-disagree',
    category: 'refund-dispute',
    title: 'Refund dispute — order #55210',
    customer: 'Tom Reyes',
    status: 'pending',
    createdAt: minutesAgo(34),
    summary:
      'Customer Agent and Reviewer Agent disagree on whether a non-delivery refund should be issued.',
    whatHappened:
      'Customer states the order never arrived and is requesting a full refund of £142. Carrier tracking shows the package marked "delivered, signed for" at the customer’s address.',
    recommendation: {
      action: 'Disputed — see agent positions',
      rationale:
        'Customer Agent and Reviewer Agent reached different conclusions from the same evidence.',
    },
    confidence: 0.5,
    requestingAgent: 'customer',
    involvedAgents: ['customer', 'reviewer', 'research'],
    evidence: [
      {
        label: 'Customer statement',
        detail:
          'Customer says no package or delivery notice was received, and no one matching the signature name lives at the address.',
        source: 'Support ticket #55210-1',
      },
      {
        label: 'Carrier record',
        detail: 'Status: delivered. Signature captured: "T. Reyes". GPS drop point matches address.',
        source: 'Carrier API',
      },
    ],
    policy: {
      name: 'Non-Delivery Refund Policy v2, §4.1',
      excerpt:
        '"A refund may be issued for a non-delivery claim only where carrier proof-of-delivery is absent, contested with independent evidence, or the delivery address does not match the order."',
      matchConfidence: 0.7,
    },
    unusualFactors: [
      'The captured signature matches the customer’s own name, which is unusual for a genuine non-delivery.',
      'This is the customer’s first claim of this kind in 2 years of orders.',
    ],
    escalationReason:
      'The two agents produced opposing recommendations from the same evidence, and the financial and trust implications of either being wrong are significant enough that policy requires human sign-off rather than automatic tie-breaking.',
    chain: [
      {
        id: 'history',
        title: 'Customer history',
        summary: 'Long-standing customer, no prior disputes.',
        confidence: 0.9,
        details: [
          {
            label: 'Account age',
            detail: '2 years, 18 orders, zero prior disputes or chargebacks.',
            source: 'Customer account record',
          },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary: 'Carrier and customer accounts of the same delivery event conflict.',
        confidence: 0.6,
        flagged: true,
        details: [
          {
            label: 'Proof of delivery',
            detail: 'Signature capture and GPS pin both point to a completed delivery.',
            source: 'Carrier API',
          },
          {
            label: 'Signature mismatch risk',
            detail:
              'Research Agent could not confirm handwriting matches customer’s prior signatures — no baseline exists.',
            source: 'Research Agent finding',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary: 'Policy conditions for a refund are not clearly met or clearly unmet.',
        confidence: 0.7,
        details: [
          {
            label: 'Matched clause',
            detail: '§4.1 requires proof-of-delivery to be "absent, contested, or address-mismatched."',
            source: 'Policy library',
          },
          {
            label: 'Ambiguity',
            detail: 'Signature exists but its authenticity is unverified — policy doesn’t define this middle case.',
            source: 'Policy library — §4.1 commentary',
          },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary: 'Customer Agent weights the customer’s account; Reviewer Agent weights the carrier record.',
        confidence: 0.5,
        flagged: true,
        details: [
          {
            label: 'Customer Agent',
            detail: 'Treats an unverified signature as effectively contested proof-of-delivery.',
            source: 'Customer Agent reasoning trace',
          },
          {
            label: 'Reviewer Agent',
            detail: 'Treats carrier proof-of-delivery as authoritative absent contrary evidence.',
            source: 'Reviewer Agent reasoning trace',
          },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'No single recommendation — escalated as a disagreement.',
        confidence: 0.5,
        details: [
          {
            label: 'Outcome',
            detail: 'Routed to human judgement rather than resolved automatically.',
            source: 'Escalation policy',
          },
        ],
      },
    ],
    disagreement: {
      pointOfDivergence:
        'Whether an unverified-but-present delivery signature counts as "contested" proof-of-delivery under §4.1.',
      autoResolvable: false,
      reasonNotAutoResolved:
        'Both positions are individually policy-consistent; resolving requires a judgement about evidentiary weight that the escalation policy reserves for a human when the financial impact exceeds £100 and the two agents’ confidence gap is below 0.2.',
      positions: [
        {
          agentId: 'customer',
          position: 'Issue a full refund of £142.',
          confidence: 0.58,
          evidence: [
            {
              label: 'No baseline signature',
              detail: 'No prior signature on file to confirm the capture is genuine.',
              source: 'Research Agent finding',
            },
            {
              label: 'Clean history',
              detail: 'Two years, zero prior disputes — low prior probability of false claim.',
              source: 'Customer account record',
            },
          ],
        },
        {
          agentId: 'reviewer',
          position: 'Decline the refund; direct customer to carrier investigation.',
          confidence: 0.63,
          evidence: [
            {
              label: 'GPS + signature match',
              detail: 'Drop-point GPS matches the delivery address exactly.',
              source: 'Carrier API',
            },
            {
              label: 'Policy default',
              detail: 'Absent contrary evidence, §4.1 treats carrier proof-of-delivery as sufficient.',
              source: 'Policy library',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'dec-vendor-waiver',
    category: 'policy-exception',
    title: 'Early termination waiver — Halden Logistics',
    status: 'pending',
    createdAt: minutesAgo(51),
    summary:
      'Operations Agent proposes waiving a £3,400 early-termination fee to exit an underperforming vendor contract early.',
    whatHappened:
      'Halden Logistics has missed delivery-time SLAs for 3 consecutive months. Operations Agent wants to switch providers immediately rather than waiting for the contract’s 60-day notice window, which requires a waiver of the early-termination fee.',
    recommendation: {
      action: 'Approve early termination without fee',
      amount: '£3,400 waived',
      rationale:
        'Projected cost of continued SLA misses (late-delivery compensation, lost repeat orders) exceeds the termination fee within 5 weeks.',
    },
    confidence: 0.66,
    requestingAgent: 'operations',
    involvedAgents: ['operations', 'research', 'planner'],
    evidence: [
      {
        label: 'SLA performance',
        detail: 'On-time rate fell from 96% to 78% over 3 months.',
        source: 'Vendor performance dashboard',
      },
      {
        label: 'Cost projection',
        detail:
          'Research Agent estimates £640/week in compensation and re-delivery costs at current SLA-miss rates.',
        source: 'Research Agent cost model',
      },
    ],
    policy: {
      name: 'Vendor Contract Exceptions Policy v1, §1.2',
      excerpt:
        '"Early termination fee waivers above £2,500 require human approval regardless of projected savings."',
      matchConfidence: 0.93,
    },
    unusualFactors: [
      'This would be the second vendor switch this quarter.',
    ],
    escalationReason:
      'The waiver amount is above the £2,500 threshold that requires human approval by policy, independent of the agent’s confidence.',
    chain: [
      {
        id: 'history',
        title: 'Vendor history',
        summary: 'Steady decline over 3 months, no recovery after 2 prior warnings.',
        confidence: 0.92,
        details: [
          {
            label: 'Warning history',
            detail: 'Formal SLA warnings sent at month 1 and month 2, no sustained improvement.',
            source: 'Vendor management log',
          },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary: 'Cost of staying exceeds cost of leaving within 5 weeks.',
        confidence: 0.7,
        details: [
          {
            label: 'Break-even model',
            detail: '£3,400 fee recovered in ~5.3 weeks at current SLA-miss cost rate.',
            source: 'Research Agent cost model',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary: 'Waiver amount exceeds the autonomous-approval threshold.',
        confidence: 0.93,
        flagged: true,
        details: [
          {
            label: 'Matched clause',
            detail: '§1.2 sets a £2,500 hard threshold for human approval.',
            source: 'Policy library',
          },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary: 'Operations Agent judges the switch cost-justified but defers on the threshold.',
        confidence: 0.66,
        details: [
          {
            label: 'Recommendation basis',
            detail: 'Cost model plus repeated SLA breach make the case straightforward on the merits.',
            source: 'Operations Agent reasoning trace',
          },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'Approve waiver and begin transition to alternate vendor.',
        confidence: 0.66,
        details: [
          {
            label: 'Proposed action',
            detail: 'Waive £3,400 fee, notify Halden Logistics, begin onboarding alternate vendor.',
            source: 'Operations Agent',
          },
        ],
      },
    ],
  },
  {
    id: 'dec-info-requested',
    category: 'compensation',
    title: 'Compensation request — order #51902',
    customer: 'Jun Watanabe',
    status: 'info-requested',
    createdAt: minutesAgo(70),
    summary:
      'Customer Agent recommends a £40 credit for a short delay; a human asked for more transaction history before deciding.',
    whatHappened:
      'Order #51902 arrived 2 days late. Customer requested compensation, citing "repeated problems," but only this one delay appears in the visible order history.',
    recommendation: {
      action: 'Issue goodwill credit',
      amount: '£40',
      rationale: 'Standard delay compensation for a 2-day SLA miss.',
    },
    confidence: 0.79,
    requestingAgent: 'customer',
    involvedAgents: ['customer'],
    evidence: [
      {
        label: 'Delivery tracking',
        detail: 'Dispatched on time, delivered 2 days after the 4-day SLA target.',
        source: 'Logistics system',
      },
      {
        label: 'Customer statement',
        detail: 'Customer references "repeated problems" with no specifics.',
        source: 'Support ticket #51902-1',
      },
    ],
    policy: {
      name: 'Goodwill Compensation Policy v3, §2.1',
      excerpt: '"A single minor delay (1–3 days) qualifies for a standard £40 goodwill credit."',
      matchConfidence: 0.9,
    },
    unusualFactors: [
      'Customer references a pattern of issues not visible in the order history the agent can see.',
    ],
    escalationReason:
      'A human asked Customer Agent to check whether "repeated problems" refers to a linked account or a prior name/address the system doesn’t currently associate with this customer.',
    infoRequestNote:
      'Can you check if this customer has other accounts under a different email or a previous surname? Their message reads like this isn’t their first contact with us.',
    chain: [
      {
        id: 'history',
        title: 'Customer history',
        summary: 'One order, one delay, no other visible history.',
        confidence: 0.6,
        flagged: true,
        details: [
          {
            label: 'Account age',
            detail: 'Account created 11 days ago — this is the only order on file.',
            source: 'Customer account record',
          },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary: 'Delay is confirmed and minor; the claimed pattern is not.',
        confidence: 0.85,
        details: [
          {
            label: 'SLA breach',
            detail: '2 days late against a 4-day target.',
            source: 'Logistics system',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary: 'Standard minor-delay tier applies to the visible facts.',
        confidence: 0.9,
        details: [
          {
            label: 'Matched clause',
            detail: '§2.1 — single minor delay, standard £40 credit.',
            source: 'Policy library',
          },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary: 'Agent recommended the standard tier without resolving the "repeated problems" reference.',
        confidence: 0.79,
        details: [
          {
            label: 'Gap noted',
            detail: 'Agent flagged the unexplained reference but did not have a way to search linked identities.',
            source: 'Customer Agent reasoning trace',
          },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'Issue £40 credit for the confirmed delay.',
        confidence: 0.79,
        details: [
          {
            label: 'Proposed action',
            detail: 'Standard credit, pending the identity check a human requested.',
            source: 'Customer Agent',
          },
        ],
      },
    ],
  },
  {
    id: 'dec-override-audit',
    category: 'compensation',
    title: 'Compensation request — order #49760',
    customer: 'Ella Brandt',
    status: 'approved',
    createdAt: minutesAgo(60 * 20),
    resolvedAt: minutesAgo(60 * 19),
    summary: 'Customer Agent recommended £250; a human approved £120 instead.',
    whatHappened:
      'Order #49760 was delayed 6 days with no damage. Customer Agent recommended £250, citing the customer’s account tier. Human review found the tier signal was misread.',
    recommendation: {
      action: 'Issue goodwill compensation',
      amount: '£250',
      rationale:
        'Customer Agent read the account as "priority tier," which carries a higher compensation multiplier.',
    },
    confidence: 0.68,
    requestingAgent: 'customer',
    involvedAgents: ['customer', 'reviewer'],
    evidence: [
      {
        label: 'Account tier',
        detail: 'Account is "priority trial," a 30-day promotional tier, not full "priority."',
        source: 'Billing system — corrected during human review',
      },
      {
        label: 'Delivery tracking',
        detail: '6 days late against a 4-day SLA target, no damage reported.',
        source: 'Logistics system',
      },
    ],
    policy: {
      name: 'Goodwill Compensation Policy v3, §2.2',
      excerpt: '"Priority-tier delays receive a 1.5x compensation multiplier; standard and trial tiers do not."',
      matchConfidence: 0.75,
    },
    unusualFactors: [
      'The account tier field is ambiguous in the billing system between "priority" and "priority trial."',
    ],
    escalationReason:
      'Confidence was below threshold because the tier multiplier is high-impact and the underlying field has caused prior misreads.',
    humanRecord: {
      action: 'approved',
      changedRecommendation: true,
      note:
        'Account is on the trial tier, not full priority — the 1.5x multiplier doesn’t apply here. Approved the standard-tier amount instead of the recommended figure.',
      timestamp: minutesAgo(60 * 19),
    },
    chain: [
      {
        id: 'history',
        title: 'Customer history',
        summary: 'New account, single order, tier field ambiguous.',
        confidence: 0.6,
        flagged: true,
        details: [
          {
            label: 'Account tier field',
            detail: 'Billing system lists "priority trial" — agent’s tier lookup matched on "priority."',
            source: 'Billing system',
          },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary: 'Delay confirmed, no damage.',
        confidence: 0.95,
        details: [
          {
            label: 'SLA breach',
            detail: '6 days late against a 4-day target.',
            source: 'Logistics system',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary: 'Priority multiplier applied based on a partial tier match.',
        confidence: 0.75,
        flagged: true,
        details: [
          {
            label: 'Matched clause',
            detail: '§2.2 — priority tier 1.5x multiplier.',
            source: 'Policy library',
          },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary: 'Agent applied the multiplier without distinguishing trial from full priority.',
        confidence: 0.68,
        details: [
          {
            label: 'Gap',
            detail: 'String match on "priority" did not exclude the "trial" qualifier.',
            source: 'Customer Agent reasoning trace',
          },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'Issue £250 goodwill compensation.',
        confidence: 0.68,
        details: [
          {
            label: 'Proposed action',
            detail: '£166 standard delay tier × 1.5 priority multiplier ≈ £250.',
            source: 'Customer Agent',
          },
        ],
      },
    ],
  },
  {
    id: 'dec-auto-resolved',
    category: 'compensation',
    title: 'Shipping refund — order #52011',
    customer: 'Noah Ferreira',
    status: 'resolved-auto',
    createdAt: minutesAgo(60 * 6),
    resolvedAt: minutesAgo(60 * 6 - 4),
    summary:
      'Customer Agent handled this end-to-end: standard shipping refund, high confidence, no escalation needed.',
    whatHappened:
      'Order #52011 shipping cost was charged twice due to a checkout error. Customer requested a refund of the duplicate charge.',
    recommendation: {
      action: 'Refund duplicate shipping charge',
      amount: '£6.99',
      rationale: 'Duplicate charge confirmed directly against the payment record — unambiguous.',
    },
    confidence: 0.98,
    requestingAgent: 'customer',
    involvedAgents: ['customer'],
    evidence: [
      {
        label: 'Payment record',
        detail: 'Two identical £6.99 shipping line items on the same order.',
        source: 'Billing system',
      },
    ],
    policy: {
      name: 'Billing Error Refund Policy v1, §1.1',
      excerpt: '"Confirmed duplicate charges are refunded automatically without a compensation tier."',
      matchConfidence: 0.99,
    },
    unusualFactors: [],
    escalationReason: 'Not escalated — confidence and policy match were both well above the autonomous threshold.',
    chain: [
      {
        id: 'history',
        title: 'Customer history',
        summary: 'No prior issues.',
        confidence: 0.9,
        details: [
          { label: 'Account age', detail: '4 years, 76 orders.', source: 'Customer account record' },
        ],
      },
      {
        id: 'knowledge',
        title: 'Knowledge gathered',
        summary: 'Duplicate charge confirmed directly.',
        confidence: 0.99,
        details: [
          {
            label: 'Billing record',
            detail: 'Two identical line items, same timestamp, same order.',
            source: 'Billing system',
          },
        ],
      },
      {
        id: 'policy-match',
        title: 'Policy matched',
        summary: 'Clean match, no ambiguity.',
        confidence: 0.99,
        details: [
          { label: 'Matched clause', detail: '§1.1 — confirmed duplicate charges.', source: 'Policy library' },
        ],
      },
      {
        id: 'reasoning',
        title: 'Agent reasoning',
        summary: 'Direct evidence, standard remedy, no judgement calls required.',
        confidence: 0.98,
        details: [
          { label: 'Basis', detail: 'Billing record is authoritative and unambiguous.', source: 'Customer Agent reasoning trace' },
        ],
      },
      {
        id: 'recommendation',
        title: 'Recommendation',
        summary: 'Refund £6.99, resolved automatically.',
        confidence: 0.98,
        details: [
          { label: 'Outcome', detail: 'Refund issued, ticket closed, no human review required.', source: 'Customer Agent' },
        ],
      },
    ],
  },
];
