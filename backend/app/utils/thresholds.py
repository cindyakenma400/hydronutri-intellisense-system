"""
Crop-specific agronomic thresholds for the three target crops.

Values follow the ranges cited in Chapter 2 of the thesis
(Appiahene & Owusu, 2022):
  - Tomato: slightly acidic soil (pH 6.0 - 6.8), moderate N and K
  - Onion:  near-neutral soil (pH 6.0 - 7.0), moderate moisture
  - Maize:  tolerates pH 5.8 - 7.0, needs larger amounts of N

Each parameter is defined as (minimum, optimal_low, optimal_high, maximum).
Readings inside the optimal band earn full marks; readings between
min/max and the optimal band earn partial marks; readings outside
min/max earn zero for that parameter.

Units:
  moisture -> %          ph  -> pH scale
  n, p, k  -> mg/kg      ec  -> dS/m
"""

CROP_THRESHOLDS = {
    "Tomato": {
        "moisture": (40, 60, 80, 90),
        "ph": (5.5, 6.0, 6.8, 7.5),
        "n": (40, 60, 120, 200),
        "p": (25, 40, 80, 150),
        "k": (40, 60, 120, 200),
        "ec": (0.5, 1.0, 2.5, 3.5),
    },
    "Onion": {
        "moisture": (35, 50, 70, 85),
        "ph": (5.8, 6.0, 7.0, 7.8),
        "n": (30, 50, 100, 180),
        "p": (20, 35, 70, 140),
        "k": (35, 50, 110, 190),
        "ec": (0.4, 0.8, 2.0, 3.0),
    },
    "Maize": {
        "moisture": (30, 45, 70, 85),
        "ph": (5.5, 5.8, 7.0, 8.0),
        "n": (50, 70, 140, 220),
        "p": (20, 30, 70, 140),
        "k": (30, 45, 100, 180),
        "ec": (0.5, 1.0, 2.5, 4.0),
    },
}

# How much each parameter contributes to the 100% suitability score.
PARAMETER_WEIGHTS = {
    "moisture": 20,
    "ph": 20,
    "n": 20,
    "p": 15,
    "k": 15,
    "ec": 10,
}

PARAMETER_LABELS = {
    "moisture": "Soil Moisture",
    "ph": "Soil pH",
    "n": "Nitrogen",
    "p": "Phosphorus",
    "k": "Potassium",
    "ec": "Electrical Conductivity",
}