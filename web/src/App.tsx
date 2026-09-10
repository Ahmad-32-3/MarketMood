import { MoodStrip } from './components/story/MoodStrip'
import { ResultBento } from './components/story/ResultBento'
import { SplitViz } from './components/story/SplitViz'
import { StackGrid } from './components/story/StackGrid'
import { StoryBeat } from './components/story/StoryBeat'
import { ABLATION, DECISIONS, META, METRICS, NEXT, SECTORS } from './data'

const TOC = [
  { href: '#problem', label: 'The problem' },
  { href: '#answer', label: 'The approach' },
  { href: '#result', label: 'The result' },
  { href: '#stack', label: 'Tech stack' },
  { href: '#decisions', label: 'Design choices' },
  { href: '#use', label: 'Running it' },
  { href: '#next', label: 'What is next' },
]

export function App() {
  return (
    <>
      <a className="skip-link" href="#problem">
        Skip to the walkthrough
      </a>

      <div className="masthead">
        <div className="masthead__inner">
          <div className="masthead__mark">
            <b>MarketMood</b> · recovering market moods from returns
          </div>
          <ul className="masthead__nav">
            <li>
              <a href="#problem">problem</a>
            </li>
            <li>
              <a href="#result">result</a>
            </li>
            <li>
              <a href="#decisions">decisions</a>
            </li>
            <li>
              <a href="#next">next</a>
            </li>
          </ul>
        </div>
      </div>

      <main className="page">
        <header className="page-hero">
          <p className="meta">A walkthrough · planted moods, a hidden-state model, a vol cutoff</p>
          <h1>MarketMood</h1>
          <p className="lead">
            Markets flip moods. Quiet days, jumpy days, crash days. A single average pretends every
            day is the same weather. A cutoff on recent bounce also misses the soft slide from one
            mood into the next. I plant a known mood sequence in synthetic daily returns, recover it
            with a small hidden-state model, and score the match on later days the model was not
            fitted on. I print that next to a rolling-volatility cutoff on the same days. The number
            I trust is how often the recovered mood is the planted one on those held-out days.
          </p>
          <p className="intro-detail">
            {META.t.toLocaleString()} days, three planted moods, first {META.nTrain.toLocaleString()}{' '}
            to fit and last {META.nTest.toLocaleString()} to score. Not a trading product. Not a live
            signal.
          </p>
          <nav aria-label="On this page">
            <ul className="toc">
              {TOC.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <StoryBeat
          id="problem"
          kicker="The problem"
          title="The weather changes. A cutoff on bounce does not keep up."
          caption="Held-out days, downsampled. Top row is the planted mood. Middle is the hidden-state recovery. Bottom is the rolling-vol cutoff. Green is calm, amber is choppy, red is crashy."
          visual={<MoodStrip />}
        >
          <p>
            Imagine you only see a market’s daily return. Some stretches barely move. Some bounce
            around without going anywhere. Some drop hard. Those stretches are moods. If you average
            them together, you get a number that never happened on any real day.
          </p>
          <p>
            The cheap fix is a cutoff on recent bounce: if the last few weeks were wild, call it a
            storm. That rule is late at the handoff, and it cannot tell a jumpy grind from a crash
            when both are loud. Soft transitions look like noise to it.
          </p>
          <p>
            I want a model that reads the sequence of moods back out of the returns, including those
            soft slides, and I want a score on days it was not fitted on.
          </p>
        </StoryBeat>

        <StoryBeat
          id="answer"
          kicker="The approach"
          title="Plant the moods, fit on the past, score the future"
          caption="Fit uses the first 70% of days. The score I report is only the last 30%. Time never shuffles."
          visual={<SplitViz />}
        >
          <p>
            I start with moods, not with the model name. Calm days are small moves. Choppy days are
            jumpy but not a crash. Crashy days are big and down. I plant those three moods as a
            hidden sequence, then draw a return each day from that mood’s typical move and bounce.
            Because I planted the labels, I can score a recovery against the truth.
          </p>
          <p>
            The recovery model is a small Hidden Markov Model. In plain words: it assumes a few
            hidden moods, each with its own typical return and bounce, and a sticky chance of staying
            in today’s mood versus switching tomorrow. After the fit, Viterbi writes down the most
            likely mood path given the returns. The model never sees the planted labels while it
            fits. Afterward I permute its anonymous state numbers onto calm / choppy / crashy, because
            the fit does not know which number is which mood.
          </p>
          <p>
            Beside it I run the cutoff: a 21-day bounce that only looks at the past, binned into three
            buckets from the training days. Same held-out days. Same permutation step. The headline is
            how often each path matches the planted mood.
          </p>
        </StoryBeat>

        <StoryBeat
          id="result"
          kicker="The result"
          title="The hidden-state path matches the planted moods. The cutoff does not."
          caption="Same held-out window as the problem strip. The middle row tracks the planted colors. The bottom row flickers."
          visual={<MoodStrip />}
        >
          <p>
            On the last {META.nTest.toLocaleString()} days, the hidden-state model matches the planted
            mood {METRICS.successPct}% of the time. The rolling-vol cutoff matches {METRICS.thresholdPct}%
            of the time. The floor I set for this page was 85%. I wanted 90 to 95. The headline
            cleared that.
          </p>
          <ResultBento />
          <p style={{ marginTop: 'var(--space-5)' }}>
            I also changed the number of moods and what the model reads, on the same planted series
            and the same time split. Three moods on raw returns is the headline. Two moods still
            scores well because it can glue choppy and crashy together. Feeding it bounce as a second
            feature hurt: 79.2%. The extra column is mostly a delayed copy of the return, and the fit
            gets confused. I keep that row so the table is not only the win.
          </p>
          <table className="choice-table">
            <caption className="sr-only">Ablation of state count and features on the same held-out days</caption>
            <thead>
              <tr>
                <th scope="col">Setup</th>
                <th scope="col">Hidden-state %</th>
                <th scope="col">Vol cutoff %</th>
              </tr>
            </thead>
            <tbody>
              {ABLATION.map((r) => (
                <tr key={`${r.k}-${r.features}`}>
                  <td>
                    K={r.k}, {r.features}
                    {r.headline ? ' (headline)' : ''}
                  </td>
                  <td style={{ color: r.headline ? 'var(--good)' : 'var(--fg)' }}>{r.hmm}</td>
                  <td>{r.vol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StoryBeat>

        <section className="story-beat" id="stack">
          <p className="story-kicker">Tech stack</p>
          <h2>What runs, in plain words</h2>
          <p className="stack-intro">
            Standard tools, so you can clone the repo and rerun the number. Each card is one piece:
            what it does, then how.
          </p>
          <StackGrid />
        </section>

        <StoryBeat
          id="decisions"
          kicker="Design choices"
          title="The calls I made"
          caption="What I first reached for, and what I built instead."
          visual={
            <div className="teach-card">
              <h3 className="teach-card__title">First idea, and what I built</h3>
              <table className="choice-table">
                <caption className="sr-only">Design choices</caption>
                <thead>
                  <tr>
                    <th scope="col">First idea</th>
                    <th scope="col">What I built</th>
                  </tr>
                </thead>
                <tbody>
                  {DECISIONS.map((d) => (
                    <tr key={d.first}>
                      <td>{d.first}</td>
                      <td>{d.built}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        >
          <p>
            <strong>I planted the moods so the score has a right answer.</strong> A live market does
            not come with a mood label. If I scored a model against my own later guess, I would be
            grading homework I wrote. Planting the sequence is how the percentage means something.
          </p>
          <p>
            <strong>I kept time in order.</strong> Shuffling days would let the fit peek at next
            month’s weather. The train window is a prefix. Mixing test days into it has to raise.
          </p>
          <p>
            <strong>I locked one metric.</strong> Held-out accuracy after permuting anonymous states
            onto the planted names. Not F1, not a trading PnL. The cutoff prints next to it so the
            95% is not a number in a vacuum.
          </p>
        </StoryBeat>

        <section className="story-beat" id="use">
          <p className="story-kicker">Running it</p>
          <h2>Clone it and rerun the number</h2>
          <p style={{ maxWidth: 'var(--measure)' }}>
            No dataset login. The series is generated. Leak tests still have to fail on purpose when
            you inject the future into train.
          </p>
          <ol className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            <li>
              <code>python -m pip install numpy hmmlearn pytest</code>
            </li>
            <li>
              <code>python -m pytest tests/test_eval.py -q</code> (the leak injection must raise)
            </li>
            <li>
              <code>python scripts/run.py</code> prints HMM % next to the vol cutoff, then the
              ablation table
            </li>
            <li>
              <code>npm --prefix web install</code> then <code>npm --prefix web run dev</code>
            </li>
          </ol>
        </section>

        <section className="story-beat" id="next">
          <p className="story-kicker">What is next</p>
          <h2>Where I would take it, and who can use the finding</h2>
          <ul className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            {NEXT.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p style={{ maxWidth: 'var(--measure)', marginTop: 'var(--space-5)' }}>
            Named desks, and the job this result actually gives them:
          </p>
          <ul className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            {SECTORS.map((s) => (
              <li key={s.name}>
                <strong>{s.name}.</strong> {s.job}
              </li>
            ))}
          </ul>
        </section>

        <footer
          id="close"
          style={{
            borderTop: '1px solid var(--line-rule)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            color: 'var(--fg-low)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          <p style={{ maxWidth: 'var(--measure)' }}>
            I wanted the hidden mood sequence back out of the returns, measured against a
            vol-threshold guess on held-out days. {METRICS.successPct}% versus {METRICS.thresholdPct}%,
            planted series, chronological split. Not a live signal and not a regime trading pitch.
          </p>
        </footer>
      </main>
    </>
  )
}
