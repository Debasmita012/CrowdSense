from deep_sort_realtime.deepsort_tracker import DeepSort

class SimpleTracker:
    def __init__(self):
        self.tracker = DeepSort(max_age=30, n_init=3, nms_max_overlap=1.0, embedder="mobilenet")

    def update(self, detections, frame=None):
        raw_detections = []
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            conf = det["confidence"]
            w = x2 - x1
            h = y2 - y1
            raw_detections.append(([x1, y1, w, h], conf, 0)) # 0 is person class

        tracks = self.tracker.update_tracks(raw_detections, frame=frame)
        
        results = []
        for track in tracks:
            if not track.is_confirmed():
                continue
            
            track_id = track.track_id
            ltrb = track.to_ltrb()
            
            x1, y1, x2, y2 = int(ltrb[0]), int(ltrb[1]), int(ltrb[2]), int(ltrb[3])
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            
            results.append({
                "id": int(track_id),
                "bbox": [x1, y1, x2, y2],
                "center": (cx, cy)
            })

        return results