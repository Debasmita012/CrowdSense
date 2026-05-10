import os
import cv2
import uuid
import json
import base64
import asyncio
import numpy as np
import collections
import time

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from detector import CrowdDetector
from tracker import SimpleTracker
from graph_builder import CrowdGraph
from anomaly import AnomalyDetector
from alert_engine import AlertEngine
from utils import draw_boxes
from predictor import FlowPredictor
from report_generator import ReportGenerator
from gcn import DynamicCrowdGCN

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# State
video_states = {}

@app.get("/")
def home():
    return {
        "message": "CrowdSense Backend Running"
    }

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    unique_name = f"{uuid.uuid4()}.mp4"
    video_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(video_path, "wb") as buffer:
        buffer.write(await file.read())
        
    video_id = unique_name.split(".")[0]
    
    # Initialize state
    video_states[video_id] = {
        "path": video_path,
        "name": file.filename,
        "alerts": [],
        "density_history": [],
        "zone_summary": [{"id": i, "max_density": 0} for i in range(100)],
        "duration": "00:00",
        "replay_buffer": collections.deque(maxlen=400),
        "zone_capacity": {str(i): 50 for i in range(100)},
        "flow_stats": {str(i): {"entries": 0, "exits": 0, "flow_rate": 0} for i in range(100)},
        "id_zone_map": {},
        "id_history": {}
    }

    return {
        "status": "success",
        "video_id": video_id
    }

# Initialize AI Models globally to save memory
detector = CrowdDetector()
tracker = SimpleTracker()
graph_builder = CrowdGraph()
anomaly_detector = AnomalyDetector()
alert_engine = AlertEngine()
predictor = FlowPredictor(num_zones=100)
gcn = DynamicCrowdGCN()

async def generate_frames(video_id: str, request: Request):
    state = video_states.get(video_id)
    if not state:
        yield {"event": "error", "data": "Video not found"}
        return
        
    cap = cv2.VideoCapture(state["path"])
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if fps > 0:
        duration_sec = total_frames / fps
        m, s = divmod(int(duration_sec), 60)
        state["duration"] = f"{m:02d}:{s:02d}"

    frames_processed = 0

    while True:
        if await request.is_disconnected():
            break

        ret, frame = cap.read()
        if not ret:
            break

        frames_processed += 1
        
        # Process every 5th frame to simulate real-time processing and save compute
        if frames_processed % 5 != 0:
            continue
            
        frame = cv2.resize(frame, (960, 540))
        detections = detector.detect(frame)
        tracked_people = tracker.update(detections, frame=frame)
        graph_data = graph_builder.build_graph(tracked_people)
        
        # Calculate GCN Anomaly Scores
        gcn_scores = gcn.compute_anomaly_scores(tracked_people, graph_data)
        
        anomalies = anomaly_detector.detect(tracked_people, graph_data, gcn_scores)
        alerts = alert_engine.generate(anomalies)

        if alerts:
            for a in alerts:
                a['frame_idx'] = frames_processed
            state["alerts"].extend(alerts)

        draw_boxes(frame, tracked_people)

        grid = np.zeros((10, 10))
        dwelled_ids = []
        current_time = time.time()
        
        for p in tracked_people:
            cx, cy = p['center']
            tid = p['id']
            gx = min(int(cx / 96), 9)
            gy = min(int(cy / 54), 9)
            grid[gy, gx] += 1
            
            zone_id = str(gy * 10 + gx)
            
            # Flow Tracking
            prev_zone = state["id_zone_map"].get(tid)
            if prev_zone is not None and prev_zone != zone_id:
                state["flow_stats"][prev_zone]["exits"] += 1
                state["flow_stats"][zone_id]["entries"] += 1
                # Simplified flow rate for demo (just entries + exits)
                state["flow_stats"][zone_id]["flow_rate"] = state["flow_stats"][zone_id]["entries"] + state["flow_stats"][zone_id]["exits"]
            state["id_zone_map"][tid] = zone_id
            
            # Dwell Tracking
            if tid not in state["id_history"]:
                state["id_history"][tid] = []
            state["id_history"][tid].append({"pos": (cx, cy), "time": current_time})
            
            # Keep last 30 seconds of history (approx)
            state["id_history"][tid] = [h for h in state["id_history"][tid] if current_time - h["time"] <= 30]
            
            if len(state["id_history"][tid]) > 10:
                pts = np.array([h["pos"] for h in state["id_history"][tid]])
                max_dist = np.max(np.linalg.norm(pts - pts[0], axis=1))
                # If moved less than 20 pixels in last 30s
                if max_dist < 20 and (current_time - state["id_history"][tid][0]["time"]) >= 25:
                    dwelled_ids.append(tid)
                    p["dwelled"] = True
            
        densities = grid.flatten()
        velocities = np.zeros((100,)) # mock velocity
        
        # Update zone summary
        for i in range(100):
            if densities[i] > state["zone_summary"][i]["max_density"]:
                state["zone_summary"][i]["max_density"] = int(densities[i])
                
        total_density = int(np.sum(densities))
        state["density_history"].append(total_density)

        # Predictor logic
        predictor.add_frame(densities, velocities)
        if len(predictor.history) == 20:
            predictor.train_on_history(epochs=20)
            
        predictions = predictor.predict_next_30s()

        # Encode frame
        _, buffer = cv2.imencode('.jpg', frame)
        b64_frame = base64.b64encode(buffer).decode('utf-8')

        payload = {
            "frame": b64_frame,
            "heatmap": densities.tolist(),
            "predictions": predictions[:, :, 0].tolist(), # shape (5, 100)
            "alerts": alerts,
            "total_density": total_density,
            "graph": graph_data,
            "gcn_scores": gcn_scores,
            "flow_stats": state["flow_stats"],
            "zone_capacity": state["zone_capacity"],
            "dwelled_ids": dwelled_ids
        }
        
        # Add to replay buffer (save small payload to avoid memory bloat)
        replay_item = {
            "timestamp": time.strftime("%H:%M:%S"),
            "heatmap": densities.tolist(),
            "alerts": alerts
        }
        state["replay_buffer"].append(replay_item)

        yield {
            "event": "message",
            "data": json.dumps(payload)
        }
        
        await asyncio.sleep(0.05)

    cap.release()

@app.get("/stream/{video_id}")
async def stream_video(video_id: str, request: Request):
    return EventSourceResponse(generate_frames(video_id, request))

@app.get("/report/{video_id}")
async def generate_report(video_id: str):
    state = video_states.get(video_id)
    if not state:
        return {"error": "Video not found"}
        
    report_gen = ReportGenerator()
    pdf_bytes = report_gen.generate_pdf(
        video_name=state["name"],
        duration=state["duration"],
        alerts=state["alerts"],
        density_history=state["density_history"],
        zone_summary=state["zone_summary"]
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=IncidentReport_{video_id}.pdf"}
    )

@app.get("/replay/{video_id}")
async def get_replay(video_id: str):
    state = video_states.get(video_id)
    if not state:
        return {"error": "Video not found"}
    return {"replay": list(state["replay_buffer"])}

@app.post("/capacity/{video_id}")
async def set_capacity(video_id: str, request: Request):
    state = video_states.get(video_id)
    if not state:
        return {"error": "Video not found"}
    data = await request.json()
    zone_id = str(data.get("zone_id"))
    capacity = data.get("capacity")
    if zone_id in state["zone_capacity"]:
        state["zone_capacity"][zone_id] = int(capacity)
    return {"status": "success", "zone_capacity": state["zone_capacity"]}