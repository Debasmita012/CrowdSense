from ultralytics import YOLO


class CrowdDetector:
    def __init__(self):
        # Load lightweight YOLOv8 model
        self.model = YOLO("yolov8n.pt")

    def detect(self, frame):
        """
        Detect people in a frame.

        Returns:
        [
            {
                "bbox": [x1, y1, x2, y2],
                "confidence": 0.95
            }
        ]
        """

        results = self.model(frame, verbose=False)

        detections = []

        for result in results:
            boxes = result.boxes

            for box in boxes:
                cls = int(box.cls[0])

                # Only detect person class
                # COCO class 0 = person
                if cls != 0:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])

                detections.append({
                    "bbox": [
                        int(x1),
                        int(y1),
                        int(x2),
                        int(y2)
                    ],
                    "confidence": round(conf, 2)
                })

        return detections