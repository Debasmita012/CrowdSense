from datetime import datetime

class AlertEngine:
    def __init__(self):
        # Prevent spamming the same alert narrative repeatedly
        self.last_alert_type = None

    def generate(self, anomalies):
        final_alerts = []

        for anomaly in anomalies:
            atype = anomaly["type"]
            
            # Simple debounce so we don't spam the exact same narrative every 5 frames
            if atype == self.last_alert_type:
                continue
                
            self.last_alert_type = atype
            
            narrative = anomaly["message"]
            action = ""

            if atype == "DENSITY_SURGE":
                narrative = "There is a sudden, rapid influx of individuals forming a dense cluster. This surge indicates a high risk of crowd crushing if not immediately addressed."
                action = "Deploy ground staff to the perimeter to slow incoming traffic and open auxiliary gates."
            elif atype == "TURBULENT_FLOW":
                narrative = "Movement vectors are chaotic and clashing, indicating cross-traffic or panic. The crowd flow has broken down into turbulence."
                action = "Broadcast directional instructions via PA system to organize flow lines."
            elif atype == "FREEZE_WAVE":
                narrative = "The crowd has reached critical density and forward movement has completely stopped. This freeze wave is a precursor to a dangerous bottleneck."
                action = "Immediately halt new entries to this zone and dispatch response teams."
            elif atype == "DWELL_WARNING":
                narrative = anomaly["message"]
                action = "Investigate stationary crowd node immediately to prevent crush."

            final_alerts.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "type": atype.replace("_", " "),
                "severity": anomaly["severity"],
                "confidence": anomaly.get("confidence", 0),
                "message": f"Claude AI Analysis: {narrative} Action Required: {action}"
            })

        return final_alerts