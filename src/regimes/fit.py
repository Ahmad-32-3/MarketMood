# HMM fit on train returns only. Rolling-vol threshold is the naive baseline.
# Vol at t uses r[t-window:t] only (excludes t and the future).

import numpy as np
from hmmlearn.hmm import GaussianHMM

from . import const


def as_obs(x):
    x = np.asarray(x, float)
    return x.reshape(-1, 1) if x.ndim == 1 else x


def fit_hmm(train_x, k=const.K, seed=const.SEED):
    x = as_obs(train_x)
    model = GaussianHMM(
        n_components=k,
        covariance_type="diag",
        n_iter=100,
        random_state=seed,
        tol=1e-4,
    )
    model.fit(x)
    return model


def hmm_predict(model, x):
    return model.predict(as_obs(x))


def make_features(returns, name="returns"):
    r = np.asarray(returns, float)
    if name == "returns":
        return r.reshape(-1, 1)
    if name == "abs":
        return np.abs(r).reshape(-1, 1)
    if name == "returns+vol":
        v = rolling_vol(r)
        fill = np.nanmean(v) if np.isfinite(v).any() else 0.0
        v = np.nan_to_num(v, nan=fill)
        return np.column_stack([r, v])
    raise ValueError(f"unknown features {name!r}")


def rolling_vol(returns, window=const.VOL_WINDOW):
    """Past-only realized vol. vol[t] ignores returns[t:]."""
    r = np.asarray(returns, float)
    n = len(r)
    out = np.full(n, np.nan)
    if n <= window:
        return out
    csum = np.concatenate([[0.0], np.cumsum(r)])
    csum2 = np.concatenate([[0.0], np.cumsum(r * r)])
    # window ending at t (exclusive): r[t-window:t]
    for t in range(window, n):
        s = csum[t] - csum[t - window]
        s2 = csum2[t] - csum2[t - window]
        out[t] = np.sqrt(max(s2 / window - (s / window) ** 2, 0.0))
    return out


def vol_threshold_predict(returns, train_idx, k=const.K, window=const.VOL_WINDOW):
    """Unsupervised tertiles (K bins) of train rolling vol, applied to all days."""
    vol = rolling_vol(returns, window)
    train_vol = vol[train_idx]
    train_vol = train_vol[np.isfinite(train_vol)]
    if train_vol.size == 0:
        return np.zeros(len(returns), dtype=int)
    qs = np.linspace(0, 1, k + 1)[1:-1]
    cuts = np.quantile(train_vol, qs)
    pred = np.digitize(np.nan_to_num(vol, nan=np.nanmin(train_vol)), cuts)
    pred[:window] = pred[window]  # warmup: copy first valid bin
    return pred.astype(int)
