// Every number on this page lives here. scripts/run.py writes metrics.json;
// these values are the measured run on the planted series (seed 7, T=5000).

export const ILLUSTRATIVE = false

export const META = {
  t: 5000,
  k: 3,
  nTrain: 3500,
  nTest: 1500,
  trainFrac: 0.7,
  volWindow: 21,
  seed: 7,
  metric: 'held-out state accuracy',
}

export const METRICS = {
  successPct: 95.53,
  thresholdPct: 49.2,
}

export type Counter = { key: string; label: string; value: number; unit: string; note: string }
export const COUNTERS: Counter[] = [
  {
    key: 'hmm',
    label: 'Hidden-state model',
    value: METRICS.successPct,
    unit: '%',
    note: 'held-out days, labels matched after a permutation',
  },
  {
    key: 'vol',
    label: 'Rolling-vol cutoff',
    value: METRICS.thresholdPct,
    unit: '%',
    note: 'same days, tertiles of past-only bounce',
  },
  {
    key: 't',
    label: 'Days in the series',
    value: META.t,
    unit: '',
    note: 'first 3,500 to fit, last 1,500 to score',
  },
  {
    key: 'k',
    label: 'Planted moods',
    value: META.k,
    unit: '',
    note: 'calm, choppy, crashy',
  },
]

export const ABLATION = [
  { k: 2, features: 'returns', hmm: 91.93, vol: 68.8, headline: false },
  { k: 3, features: 'returns', hmm: 95.53, vol: 49.2, headline: true },
  { k: 3, features: 'abs returns', hmm: 93.73, vol: 49.2, headline: false },
  { k: 3, features: 'returns + vol', hmm: 79.2, vol: 49.2, headline: false },
]

export const MOODS = [
  { id: 0, name: 'calm', gloss: 'quiet days, small moves' },
  { id: 1, name: 'choppy', gloss: 'jumpy days, no crash' },
  { id: 2, name: 'crashy', gloss: 'big down days' },
] as const

// Downsampled held-out window (every 4th day, first 480 test days). 0/1/2 = moods.
export const STRIP = {
  true: [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  hmm: [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  vol: [1, 2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
}

export const SPLIT = {
  trainLabel: `Days 1–${META.nTrain.toLocaleString()}`,
  testLabel: `Days ${(META.nTrain + 1).toLocaleString()}–${META.t.toLocaleString()}`,
}

export const DECISIONS = [
  { first: 'Download a market and guess the moods', built: 'Plant the moods so the score has ground truth' },
  { first: 'Shuffle days into train and test', built: 'Keep time in order: fit on the past, score the future' },
  { first: 'Call high bounce a storm and stop', built: 'Fit a small hidden-state model and print the cutoff beside it' },
  { first: 'A zoo of state counts and features', built: 'Lock K=3 on raw returns; ablate K and features on the same split' },
]

export const TOOLS = [
  {
    name: 'numpy',
    tag: 'data',
    plain: 'Builds the fake daily returns and the planted mood labels.',
    tech: 'A 1-d Gaussian HMM draw: sticky transitions, three means and three vols.',
  },
  {
    name: 'hmmlearn',
    tag: 'fit',
    plain: 'The small hidden-state model that has to recover the moods from returns only.',
    tech: 'GaussianHMM, diagonal covariance, fit on the train prefix, Viterbi on the series.',
  },
  {
    name: 'rolling vol cutoff',
    tag: 'baseline',
    plain: 'The naive guess: bin recent bounce and call that the mood.',
    tech: '21-day past-only standard deviation, tertiles from train, applied to holdout.',
  },
  {
    name: 'pytest',
    tag: 'check',
    plain: 'A leak must fail. Mixing future days into train raises.',
    tech: 'Chrono split asserts train.max < test.min. Vol at t ignores returns[t:].',
  },
  {
    name: 'Vite + React',
    tag: 'page',
    plain: 'This walkthrough. Charts read static numbers, not a live API.',
    tech: 'TypeScript, Tailwind v4, hand SVG on the Bklit tokens. No HTTP.',
  },
]

export const NEXT = [
  'Try a public returns series that already has a published mood rule, and keep the same chrono split.',
  'See whether a two-feature model can be made to beat raw returns without the 79% drop I saw here.',
  'Keep K small. A bigger state zoo would fit noise on this planted series.',
]

export const SECTORS = [
  {
    name: 'Risk regime switches',
    job: 'A desk that changes limits when the market mood flips can test that switch against a planted sequence, not a story about last month.',
  },
  {
    name: 'CTA overlays',
    job: 'Trend-following sleeves that slow down in chop can check whether the overlay is reading mood or just yesterday’s bounce.',
  },
  {
    name: 'Stress testing',
    job: 'A crashy planted stretch is a cheap place to ask whether a book’s loss lines up with the mood it claims to be in.',
  },
]
