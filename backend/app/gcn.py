import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class CrowdGCN(nn.Module):
    def __init__(self, in_channels, hidden_channels):
        super(CrowdGCN, self).__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, 1)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = torch.relu(x)
        x = self.conv2(x, edge_index)
        return torch.sigmoid(x)

class DynamicCrowdGCN:
    def __init__(self):
        self.model = CrowdGCN(in_channels=2, hidden_channels=8)
        self.history = {}
        
    def compute_anomaly_scores(self, tracked_people, graph_data):
        if len(tracked_people) == 0:
            return {}
            
        nodes = graph_data["nodes"]
        edges = graph_data["edges"]
        
        node_id_to_idx = {n["id"]: i for i, n in enumerate(nodes)}
        
        edge_list = []
        for e in edges:
            if e["source"] in node_id_to_idx and e["target"] in node_id_to_idx:
                u = node_id_to_idx[e["source"]]
                v = node_id_to_idx[e["target"]]
                edge_list.append([u, v])
                edge_list.append([v, u])
                
        if len(edge_list) > 0:
            edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
        else:
            edge_index = torch.empty((2, 0), dtype=torch.long)
            
        x_list = []
        for person in tracked_people:
            pid = person["id"]
            cx, cy = person["center"]
            
            vx, vy = 0, 0
            if pid in self.history:
                px, py = self.history[pid]
                vx = cx - px
                vy = cy - py
                
            self.history[pid] = (cx, cy)
            x_list.append([vx, vy])
            
        x = torch.tensor(x_list, dtype=torch.float32)
        
        self.model.eval()
        with torch.no_grad():
            scores = self.model(x, edge_index)
            
        scores = scores.view(-1).tolist()
        
        result = {}
        for i, person in enumerate(tracked_people):
            vx, vy = x_list[i]
            speed = (vx**2 + vy**2)**0.5
            
            # Combine GCN output with actual speed to make it visually meaningful
            gcn_val = scores[i]
            base_score = min(1.0, speed / 15.0) 
            
            final_score = 0.3 * gcn_val + 0.7 * base_score
            result[person["id"]] = round(final_score, 2)
            
        return result
