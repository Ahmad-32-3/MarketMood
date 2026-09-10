# Chronological holdout. Train is a strict prefix. Future days in train = leak.

import numpy as np

from . import const


def chrono_split(n, train_frac=const.TRAIN_FRAC):
    n_train = int(n * train_frac)
    if n_train < 1 or n_train >= n:
        raise ValueError("split: need both train and test days")
    train_idx = np.arange(n_train)
    test_idx = np.arange(n_train, n)
    check_no_leak(train_idx, test_idx)
    return train_idx, test_idx


def check_no_leak(train_idx, test_idx):
    train_idx = np.asarray(train_idx)
    test_idx = np.asarray(test_idx)
    if train_idx.size == 0 or test_idx.size == 0:
        raise ValueError("leak: empty train or test")
    if np.intersect1d(train_idx, test_idx).size:
        raise ValueError("leak: train and test share days")
    if train_idx.max() >= test_idx.min():
        raise ValueError("leak: train peeks into or past the test start")
