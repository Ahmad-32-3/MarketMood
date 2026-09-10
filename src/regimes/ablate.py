# Ablation: K in {2,3} and observation features. Same planted labels, same chrono split.

from . import const
from .data import generate
from .eval import evaluate


ROWS = (
    (2, "returns"),
    (3, "returns"),
    (3, "abs"),
    (3, "returns+vol"),
)


def ablation(returns=None, labels=None, seed=const.SEED):
    if returns is None or labels is None:
        returns, labels = generate(seed=seed)
    rows = []
    for k, features in ROWS:
        m = evaluate(returns=returns, labels=labels, k=k, features=features, seed=seed)
        rows.append(
            {
                "k": k,
                "features": features,
                "success_pct": m["success_pct"],
                "threshold_pct": m["threshold_pct"],
                "headline": k == 3 and features == "returns",
            }
        )
    return rows


def print_table(rows):
    print(f"{'k':<4}{'features':<14}{'HMM%':>8}{'vol%':>8}  note")
    for r in rows:
        note = "headline" if r["headline"] else ""
        print(f"{r['k']:<4}{r['features']:<14}{r['success_pct']:>8.2f}{r['threshold_pct']:>8.2f}  {note}")
