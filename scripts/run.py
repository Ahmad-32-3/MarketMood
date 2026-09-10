"""Fit planted HMM vs rolling-vol threshold. Print success_pct next to baseline."""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from regimes import const
from regimes.ablate import ablation, print_table
from regimes.eval import evaluate, print_report

METRICS = "metrics.json"


def main():
    if const.T > const.MAX_T:
        sys.exit(f"HARD FAIL: T={const.T} over cap {const.MAX_T}")
    if const.K > const.MAX_K:
        sys.exit(f"HARD FAIL: K={const.K} over cap {const.MAX_K}")
    m = evaluate()
    with open(METRICS, "w") as f:
        json.dump(m, f, indent=2)
    print_report(m)
    print()
    print_table(ablation())


if __name__ == "__main__":
    main()
