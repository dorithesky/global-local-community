import type { AiAnalysis, Category } from './types';

const CATEGORY_RULES: Record<Category, string[]> = {
  housing: ['rent', 'deposit', 'officetel', 'apartment', 'villa', 'landlord', 'housing'],
  jobs: ['job', 'hiring', 'recruiter', 'salary', 'visa', 'part-time', 'full-time'],
  'daily-life': ['bank', 'hospital', 'arc', 'phone', 'dentist', 'immigration', 'utility'],
  events: ['meetup', 'event', 'exchange', 'club', 'gathering', 'sunday'],
  marketplace: ['selling', 'buy', 'pickup', 'marketplace', 'rice cooker', 'furniture'],
};

const SPAM_SIGNALS = ['telegram me', 'crypto', 'guaranteed income', 'dm for investment'];

export function classifyContent(input: { title: string; body: string }): AiAnalysis {
  const haystack = `${input.title} ${input.body}`.toLowerCase();

  for (const [label, words] of Object.entries(CATEGORY_RULES) as [Category, string[]][]) {
    const hits = words.filter((word) => haystack.includes(word)).length;
    if (hits >= 2) {
      return {
        label,
        score: Math.min(0.99, 0.72 + hits * 0.08),
        explanation: `Matched ${hits} category cues for ${label}.`,
      };
    }
  }

  return {
    label: 'daily-life',
    score: 0.55,
    explanation: 'No strong category cues found, defaulting to daily-life.',
  };
}

export function detectToxicityOrSpam(input: { title: string; body: string }): AiAnalysis {
  const haystack = `${input.title} ${input.body}`.toLowerCase();
  const spamHits = SPAM_SIGNALS.filter((signal) => haystack.includes(signal)).length;

  if (spamHits > 0) {
    return {
      label: 'spam-risk',
      score: Math.min(0.99, 0.7 + spamHits * 0.1),
      explanation: `Matched ${spamHits} known spam phrases.`,
    };
  }

  return {
    label: 'safe',
    score: 0.08,
    explanation: 'No rule-based toxicity or spam signals detected.',
  };
}

export function semanticSimilarityStub(a: string, b: string) {
  const shared = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const other = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const overlap = [...shared].filter((token) => other.has(token)).length;
  const union = new Set([...shared, ...other]).size || 1;
  const score = overlap / union;

  return {
    score,
    label: score > 0.45 ? 'related' : 'distant',
    explanation: `Shared ${overlap} semantic tokens across ${union} unique tokens.`,
  };
}
