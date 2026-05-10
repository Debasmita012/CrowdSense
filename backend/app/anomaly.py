import numpy as np

class AnomalyDetector:
    def __init__(self):
        self.density_history = []
        self.velocity_variance_history = []
        self.avg_velocity_history = []

    def detect(self, tracked_people, graph_data, gcn_scores):
        alerts = []
        crowd_size = len(tracked_people)
        
        self.density_history.append(crowd_size)
        if len(self.density_history) > 30:
            self.density_history.pop(0)
            
        dwelled_count = sum(1 for p in tracked_people if p.get("dwelled"))
        
        # Calculate confidence score based on signals
        # One signal = 40, two = 70, all three = 95
        signals_fired = 0
        current_alerts = []
        
        if len(self.density_history) == 30:
            increase = self.density_history[-1] - self.density_history[0]
            if increase > 15:
                signals_fired += 1
                current_alerts.append({
                    "type": "DENSITY_SURGE",
                    "severity": "HIGH",
                    "message": f"Density surged by {increase} people in the last 6 seconds."
                })
                
        # Calculate velocity stats from GCN scores or tracking directly
        scores = list(gcn_scores.values())
        if scores:
            var_score = np.var(scores)
            avg_score = np.mean(scores)
            
            self.velocity_variance_history.append(var_score)
            self.avg_velocity_history.append(avg_score)
            
            if len(self.velocity_variance_history) > 10:
                self.velocity_variance_history.pop(0)
                self.avg_velocity_history.pop(0)
                
            # 2. Turbulent Flow
            if np.mean(self.velocity_variance_history) > 0.05:
                signals_fired += 1
                current_alerts.append({
                    "type": "TURBULENT_FLOW",
                    "severity": "MEDIUM",
                    "message": "High variance in crowd movement detected, indicating cross-traffic."
                })
                
            # 3. Freeze Wave
            if crowd_size > 20 and np.mean(self.avg_velocity_history) < 0.15:
                signals_fired += 1
                current_alerts.append({
                    "type": "FREEZE_WAVE",
                    "severity": "HIGH",
                    "message": "Crowd has stopped moving despite high density (bottleneck)."
                })
                
        # Confidence logic
        confidence = 0
        if signals_fired == 1:
            confidence = 40
        elif signals_fired == 2:
            confidence = 70
        elif signals_fired >= 3:
            confidence = 95
            
        for a in current_alerts:
            a["confidence"] = confidence
            alerts.append(a)
            
        # Dwell Time Detection
        if dwelled_count > 3 and crowd_size > 15: # Arbitrary threshold for high density
            alerts.append({
                "type": "DWELL_WARNING",
                "severity": "HIGH",
                "message": f"{dwelled_count} individuals stationary for 30+ seconds in high-density zone. Strong crush precursor signal.",
                "confidence": 85
            })

        return alerts