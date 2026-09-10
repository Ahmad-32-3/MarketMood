import { SPLIT } from '../../data'

export function SplitViz() {
  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Time stays in order</h3>
      <div className="split-row">
        <div className="split-col">
          <p className="meta split-col__head">Fit on the past</p>
          <div className="split-chips">
            <span className="chip chip--train">{SPLIT.trainLabel}</span>
          </div>
        </div>
        <div className="split-arrow" aria-hidden="true">
          →
        </div>
        <div className="split-col">
          <p className="meta split-col__head">Score the future</p>
          <div className="split-chips">
            <span className="chip chip--held">{SPLIT.testLabel}</span>
          </div>
        </div>
      </div>
      <p className="meta" style={{ margin: '0.75rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        The number I report is only from days after the fit window. Mixing those days back into
        training is a leak, and the tests reject it.
      </p>
    </div>
  )
}
