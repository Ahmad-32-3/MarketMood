# MarketMood

Markets flip moods. Quiet days, jumpy days, crash days. A single average pretends every day is the same weather. A cutoff on recent bounce also misses the soft slide from one mood into the next.

I plant a known mood sequence in synthetic daily returns, recover it with a small hidden Markov model (2-3 states), and score the match on later days the model was not fitted on. I print that next to a rolling-volatility cutoff on the same days.

Headline, measured: 95.53% hidden-state recovery versus 49.20% rolling-vol cutoff on the last 1,500 of 5,000 planted days.

## Run

```bash
python -m pytest tests/ -q
python scripts/run.py
npm --prefix web install
npm --prefix web run dev
```

`scripts/run.py` prints HMM recovery next to the threshold baseline. Label leakage / future peek must fail in pytest. `hmmlearn` or a thin Baum-Welch.

## Layout

- `src/` planted regimes, HMM fit, eval
- `scripts/run.py`
- `tests/` leak checks
- `web/` case-study page
