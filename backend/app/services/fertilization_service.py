def get_fertilizer_recommendation(
    nitrogen,
    phosphorus,
    potassium
):

    recommendations = []

    if nitrogen < 50:
        recommendations.append(
            "Apply Nitrogen-rich fertilizer (Urea)"
        )

    if phosphorus < 40:
        recommendations.append(
            "Apply Phosphorus-rich fertilizer (DAP)"
        )

    if potassium < 50:
        recommendations.append(
            "Apply Potassium-rich fertilizer (MOP)"
        )

    if not recommendations:
        recommendations.append(
            "NPK levels are within acceptable range"
        )

    return recommendations