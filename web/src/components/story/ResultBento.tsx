import { COUNTERS } from '../../data'

export function ResultBento() {
  return (
    <div className="bento" role="group" aria-label="Held-out mood recovery">
      {COUNTERS.map((c) => (
        <div key={c.key} className="bento__cell">
          <div className="bento__value">
            {c.value}
            {c.unit ? <span className="bento__unit"> {c.unit}</span> : null}
          </div>
          <div className="bento__label">{c.label}</div>
          <div className="bento__note">{c.note}</div>
        </div>
      ))}
    </div>
  )
}
