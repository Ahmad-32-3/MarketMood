# DESIGN left column. Change a knob → one ADR line in DESIGN.md.

K = 3
MAX_K = 3
T = 5000
MAX_T = 8000
TRAIN_FRAC = 0.70
VOL_WINDOW = 21
SEED = 7

# Planted 1-d Gaussian HMM: calm / choppy / crashy. Sticky diagonals so
# Viterbi has a sequence to recover, not a coin flip each day.
MEANS = (0.0005, 0.0, -0.003)
STDS = (0.005, 0.014, 0.040)
TRANS = (
    (0.980, 0.015, 0.005),
    (0.030, 0.960, 0.010),
    (0.050, 0.050, 0.900),
)
START = (0.70, 0.25, 0.05)
