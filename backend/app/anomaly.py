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
            
        # 1. Density Surge: Rapid increase in 30 frames
        if len(self.density_history) == 30:
            increase = self.density_history[-1] - self.density_history[0]
            if increase > 15:
                alerts.append({
                    "type": "DENSITY_SURGE",
                    "severity": "HIGH",
                    "message": f"Density surged by {increase} people in the last 6 seconds."
                })
                
        # Calculate velocity stats from GCN scores or tracking directly
        # gcn_scores is dict: id -> score. We assume high score means high/erratic speed.
        scores = list(gcn_scores.values())
        if scores:
            var_score = np.var(scores)
            avg_score = np.mean(scores)
            
            self.velocity_variance_history.append(var_score)
            self.avg_velocity_history.append(avg_score)
            
            if len(self.velocity_variance_history) > 10:
                self.velocity_variance_history.pop(0)
                self.avg_velocity_history.pop(0)
                
            # 2. Turbulent Flow: High variance in movements
            if np.mean(self.velocity_variance_history) > 0.05:
                alerts.append({
                    "type": "TURBULENT_FLOW",
                    "severity": "MEDIUM",
                    "message": "High variance in crowd movement detected, indicating cross-traffic."
                })
                
            # 3. Freeze Wave: High density but speed dropping near 0
            if crowd_size > 20 and np.mean(self.avg_velocity_history) < 0.15:
                alerts.append({
                    "type": "FREEZE_WAVE",
                    "severity": "HIGH",
                    "message": "Crowd has stopped moving despite high density (bottleneck)."
                })

        return alerts