# Locked metric: held-out state accuracy after permuting HMM labels → success_pct.

import itertools

import numpy as np

from . import const
from .data import generate
from .fit import fit_hmm, hmm_predict, make_features, vol_threshold_predict
from .split import chrono_split, check_no_leak


def permute_accuracy(y_true, y_pred, k=None):
    y_true = np.asarray(y_true, int)
    y_pred = np.asarray(y_pred, int)
    if k is None:
        k = int(max(y_true.max(initial=0), y_pred.max(initial=0))) + 1
    best = 0.0
    for perm in itertools.permutations(range(k)):
        mapped = np.empty_like(y_pred)
        for src, dst in enumerate(perm):
            mapped[y_pred == src] = dst
        acc = float(np.mean(mapped == y_true))
        if acc > best:
            best = acc
    return best


def evaluate(returns=None, labels=None, k=const.K, seed=const.SEED, features="returns"):
    if returns is None or labels is None:
        returns, labels = generate(seed=seed)
    n = len(returns)
    if n > const.MAX_T:
        raise ValueError(f"cap: T={n} exceeds MAX_T={const.MAX_T}")
    if k > const.MAX_K:
        raise ValueError(f"cap: K={k} exceeds MAX_K={const.MAX_K}")
    train_idx, test_idx = chrono_split(n)
    check_no_leak(train_idx, test_idx)

    x = make_features(returns, features)
    model = fit_hmm(x[train_idx], k=k, seed=seed)
    hmm_all = hmm_predict(model, x)
    vol_all = vol_threshold_predict(returns, train_idx, k=k)

    hmm_acc = permute_accuracy(labels[test_idx], hmm_all[test_idx], k=k)
    vol_acc = permute_accuracy(labels[test_idx], vol_all[test_idx], k=k)
    return {
        "success_pct": round(100.0 * hmm_acc, 2),
        "threshold_pct": round(100.0 * vol_acc, 2),
        "metric": "heldout_state_accuracy",
        "k": int(k),
        "t": int(n),
        "n_train": int(len(train_idx)),
        "n_test": int(len(test_idx)),
        "seed": int(seed),
        "features": features,
        "illustrative": False,
    }


def print_report(m):
    print(
        f"HMM held-out accuracy {m['success_pct']:.2f}%  |  "
        f"vol-threshold {m['threshold_pct']:.2f}%"
    )
    print(
        f"metric {m['metric']}  k {m['k']}  T {m['t']}  "
        f"n_train {m['n_train']}  n_test {m['n_test']}"
    )
