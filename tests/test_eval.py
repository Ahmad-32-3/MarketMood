import numpy as np
import pytest

from regimes import const
from regimes.ablate import ROWS, ablation
from regimes.data import generate
from regimes.eval import evaluate, permute_accuracy
from regimes.fit import rolling_vol
from regimes.split import check_no_leak, chrono_split


def test_chrono_split_is_strict_prefix():
    train, test = chrono_split(1000)
    assert train.max() < test.min()
    assert np.intersect1d(train, test).size == 0
    assert train[0] == 0
    assert test[-1] == 999


def test_leak_injection_fails():
    """A test window mixed into train must raise. This is the leak that must fail."""
    train, test = chrono_split(500)
    leaked = np.concatenate([train, test[:20]])
    with pytest.raises(ValueError, match="leak"):
        check_no_leak(leaked, test)


def test_future_peek_split_fails():
    train = np.arange(0, 400)
    test = np.arange(350, 500)
    with pytest.raises(ValueError, match="leak"):
        check_no_leak(train, test)


def test_rolling_vol_ignores_future():
    rng = np.random.default_rng(0)
    r = rng.normal(0, 0.01, 400)
    v1 = rolling_vol(r)
    r2 = r.copy()
    r2[200:] = 9.0
    v2 = rolling_vol(r2)
    np.testing.assert_allclose(v1[:200], v2[:200], equal_nan=True)
    assert not np.allclose(v1[220:], v2[220:], equal_nan=True)


def test_permute_accuracy_recovers_shuffled_labels():
    y = np.array([0, 0, 1, 1, 2, 2])
    pred = np.array([2, 2, 0, 0, 1, 1])  # 0→2, 1→0, 2→1
    assert permute_accuracy(y, pred, k=3) == pytest.approx(1.0)


def test_caps_match_design():
    assert const.T <= const.MAX_T
    assert const.K <= const.MAX_K
    r, z = generate()
    assert len(r) == const.T
    assert len(z) == const.T
    assert set(np.unique(z)).issubset(set(range(const.K)))


def test_hmm_beats_threshold_and_clears_floor():
    m = evaluate()
    assert m["metric"] == "heldout_state_accuracy"
    assert m["success_pct"] >= 85.0
    assert m["success_pct"] >= m["threshold_pct"]
    assert m["k"] == const.K
    assert m["t"] == const.T
    assert m["features"] == "returns"
    assert m["illustrative"] is False


def test_web_h1_is_regimes():
    text = open("web/src/App.tsx", encoding="utf-8").read()
    assert "<h1>regimes</h1>" in text


def test_ablation_k_and_features():
    rows = ablation()
    assert [(r["k"], r["features"]) for r in rows] == list(ROWS)
    by = {(r["k"], r["features"]): r["success_pct"] for r in rows}
    assert by[(3, "returns")] >= 85.0
    assert by[(3, "returns")] >= by[(2, "returns")]
    headlines = [r for r in rows if r["headline"]]
    assert len(headlines) == 1
    assert headlines[0]["k"] == 3 and headlines[0]["features"] == "returns"
