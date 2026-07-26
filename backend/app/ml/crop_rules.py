"""
Rule-based multi-crop soil suitability engine.

For every crop (Tomato, Onion, Maize) each soil parameter is scored
using a trapezoidal membership function against the crop's threshold
band, weighted, and summed into a 0-100 suitability score. The engine
also reports the limiting factors and practical amendment suggestions
for each crop, fulfilling Specific Objective 2 of the thesis.
"""

from app.utils.thresholds import (
    CROP_THRESHOLDS,
    PARAMETER_WEIGHTS,
    PARAMETER_LABELS,
)


def _parameter_score(value, band):
    """
    Trapezoidal score between 0.0 and 1.0.

    band = (minimum, optimal_low, optimal_high, maximum)
    Full score inside the optimal band, linearly decreasing
    towards the min/max limits, zero outside them.
    """
    minimum, opt_low, opt_high, maximum = band

    if value is None:
        return 0.0

    if opt_low <= value <= opt_high:
        return 1.0

    if value <= minimum or value >= maximum:
        return 0.0

    if value < opt_low:
        return (value - minimum) / (opt_low - minimum)

    return (maximum - value) / (maximum - opt_high)


def _amendment_for(param, value, band, crop):
    """Human-readable corrective action for a sub-optimal parameter."""
    _, opt_low, opt_high, _ = band
    label = PARAMETER_LABELS[param]

    low = value < opt_low

    suggestions = {
        "moisture": (
            f"Increase irrigation: raise soil moisture towards "
            f"{opt_low}-{opt_high}% for {crop}.",
            f"Reduce irrigation: allow soil to dry towards "
            f"{opt_low}-{opt_high}% for {crop}."
        ),
        "ph": (
            f"Soil is too acidic for {crop}: apply agricultural lime "
            f"to raise pH into the {opt_low}-{opt_high} range.",
            f"Soil is too alkaline for {crop}: apply organic matter or "
            f"elemental sulphur to lower pH into the "
            f"{opt_low}-{opt_high} range."
        ),
        "n": (
            f"Nitrogen is low for {crop}: apply nitrogen-rich "
            f"fertilizer (e.g. Urea).",
            f"Nitrogen is high for {crop}: pause nitrogen fertilizer "
            f"to avoid excessive vegetative growth."
        ),
        "p": (
            f"Phosphorus is low for {crop}: apply phosphate "
            f"fertilizer (e.g. DAP or TSP).",
            f"Phosphorus is high for {crop}: pause phosphate "
            f"application."
        ),
        "k": (
            f"Potassium is low for {crop}: apply potassium fertilizer "
            f"(e.g. MOP).",
            f"Potassium is high for {crop}: pause potassium "
            f"application."
        ),
        "ec": (
            f"Nutrient concentration (EC) is low for {crop}: apply a "
            f"balanced NPK feed.",
            f"EC is high for {crop} (salinity risk): leach the soil "
            f"with fresh water and pause fertilization."
        ),
    }

    return suggestions[param][0 if low else 1]


def score_crop(crop, moisture, ph, nitrogen, phosphorus, potassium, ec=None):
    """
    Returns the weighted 0-100 suitability score for one crop,
    plus its limiting factors and amendment suggestions.
    """
    thresholds = CROP_THRESHOLDS[crop]

    readings = {
        "moisture": moisture,
        "ph": ph,
        "n": nitrogen,
        "p": phosphorus,
        "k": potassium,
        "ec": ec,
    }

    total_score = 0.0
    total_weight = 0
    limiting_factors = []
    suggestions = []

    for param, band in thresholds.items():
        value = readings.get(param)

        # EC sensor may not be connected yet -> exclude from score
        if param == "ec" and (value is None or value <= 0):
            continue

        weight = PARAMETER_WEIGHTS[param]
        partial = _parameter_score(value, band)

        total_score += partial * weight
        total_weight += weight

        if partial < 1.0:
            limiting_factors.append(PARAMETER_LABELS[param])
            suggestions.append(
                _amendment_for(param, value, band, crop)
            )

    score = round(100 * total_score / total_weight, 1) if total_weight else 0.0

    if score >= 80:
        suitability = "Highly Suitable"
    elif score >= 60:
        suitability = "Suitable"
    elif score >= 40:
        suitability = "Marginally Suitable"
    else:
        suitability = "Not Suitable"

    return {
        "crop": crop,
        "score": score,
        "suitability": suitability,
        "limiting_factors": limiting_factors,
        "suggestions": suggestions,
    }


def rank_crops(moisture, ph, nitrogen, phosphorus, potassium, ec=None):
    """
    Scores every target crop and returns them ranked
    from most to least suitable.
    """
    results = [
        score_crop(
            crop,
            moisture,
            ph,
            nitrogen,
            phosphorus,
            potassium,
            ec
        )
        for crop in CROP_THRESHOLDS
    ]

    results.sort(key=lambda item: item["score"], reverse=True)

    return results