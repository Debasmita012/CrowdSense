import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class CrowdLSTM(nn.Module):
    def __init__(self, input_size=200, hidden_size=64, output_size=200):
        super(CrowdLSTM, self).__init__()
        # input_size = 100 zones * 2 features = 200
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # x shape: (batch, seq_len, 200)
        lstm_out, _ = self.lstm(x)
        # We want to predict the next 5 frames.
        # Let's just predict 5 steps from the last hidden state.
        # For simplicity, we can output (batch, 5, 200).
        # We'll take the last lstm_out: (batch, hidden_size)
        last_out = lstm_out[:, -1, :]
        
        # simple linear projection to 5 * 200
        out = self.fc(last_out)
        out = out.view(-1, 5, 200)
        return out

class FlowPredictor:
    def __init__(self, num_zones=100):
        self.num_zones = num_zones
        self.model = CrowdLSTM(input_size=num_zones*2, hidden_size=64, output_size=5*num_zones*2)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.01)
        self.criterion = nn.MSELoss()
        
        # Keep history of (density, velocity) per zone
        # Shape: (frames, 100, 2)
        self.history = []
        
    def add_frame(self, zone_densities, zone_velocities):
        # zone_densities: list or array of 100
        # zone_velocities: list or array of 100
        frame_data = np.stack([zone_densities, zone_velocities], axis=1) # (100, 2)
        self.history.append(frame_data)
        
    def train_on_history(self, epochs=20):
        if len(self.history) < 15:
            return # Not enough data
            
        data = np.array(self.history) # (T, 100, 2)
        data = data.reshape(len(data), -1) # (T, 200)
        
        # Create sequences of length 10 -> predict next 5
        X, Y = [], []
        for i in range(len(data) - 15):
            X.append(data[i:i+10])
            Y.append(data[i+10:i+15])
            
        if len(X) == 0:
            return
            
        X = torch.tensor(np.array(X), dtype=torch.float32)
        Y = torch.tensor(np.array(Y), dtype=torch.float32)
        
        self.model.train()
        for epoch in range(epochs):
            self.optimizer.zero_grad()
            out = self.model(X)
            loss = self.criterion(out, Y)
            loss.backward()
            self.optimizer.step()
            
    def predict_next_30s(self):
        # 30s at 5 processed frames could mean next 5 processed frames
        if len(self.history) < 10:
            return np.zeros((5, self.num_zones, 2))
            
        recent = np.array(self.history[-10:]) # (10, 100, 2)
        recent = recent.reshape(1, 10, 200)
        
        self.model.eval()
        with torch.no_grad():
            x = torch.tensor(recent, dtype=torch.float32)
            pred = self.model(x) # (1, 5, 200)
            
        pred = pred.numpy().reshape(5, self.num_zones, 2)
        # Ensure non-negative density
        pred[:, :, 0] = np.clip(pred[:, :, 0], 0, None)
        return pred
