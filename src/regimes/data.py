import numpy as np

from . import const


def generate(t=const.T, k=const.K, seed=const.SEED):
    """Planted 1-d Gaussian HMM returns + the hidden mood labels."""
    if t > const.MAX_T:
        raise ValueError(f"cap: T={t} exceeds MAX_T={const.MAX_T}")
    if k > const.MAX_K:
        raise ValueError(f"cap: K={k} exceeds MAX_K={const.MAX_K}")
    rng = np.random.default_rng(seed)
    means = np.asarray(const.MEANS[:k], float)
    stds = np.asarray(const.STDS[:k], float)
    trans = np.asarray(const.TRANS, float)[:k, :k]
    trans = trans / trans.sum(axis=1, keepdims=True)
    start = np.asarray(const.START[:k], float)
    start = start / start.sum()

    z = np.empty(t, dtype=int)
    r = np.empty(t, dtype=float)
    z[0] = rng.choice(k, p=start)
    r[0] = rng.normal(means[z[0]], stds[z[0]])
    for i in range(1, t):
        z[i] = rng.choice(k, p=trans[z[i - 1]])
        r[i] = rng.normal(means[z[i]], stds[z[i]])
    return r, z
