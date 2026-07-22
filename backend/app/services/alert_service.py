def generate_alerts(
    soil_moisture,
    soil_ph
):

    alerts = []

    if soil_moisture < 30:
        alerts.append({
            "type": "Irrigation Alert",
            "message": "Soil moisture is critically low."
        })

    if soil_ph > 7.5:
        alerts.append({
            "type": "Soil pH Alert",
            "message": "Soil pH is above recommended range."
        })

    if not alerts:
        alerts.append({
            "type": "System Status",
            "message": "All parameters are within acceptable limits."
        })

    return alerts