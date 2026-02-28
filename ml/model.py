"""
ml/model.py — AQIPredictor GRU neural network.

Single-layer GRU for 6-hour AQI forecasting.
Input  : (batch_size, 24, 6)  — 24hr lookback, 6 features
Output : (batch_size,)         — predicted AQI scalar
"""
from __future__ import annotations

import torch
import torch.nn as nn

from config import INPUT_SIZE, HIDDEN_SIZE


class AQIPredictor(nn.Module):
    """
    Single-layer GRU for 6-hour AQI forecasting.

    Architecture choices:
    - Single GRU layer — faster training, equivalent performance on this
      dataset size, easier to debug under hackathon constraints.
    - Huber loss (at training time) — handles AQI spike outliers better
      than MSE.
    - No Dropout at inference — keep predictions clean for demo.
    """

    def __init__(self, input_size: int = INPUT_SIZE, hidden_size: int = HIDDEN_SIZE) -> None:
        super().__init__()
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=1,
            batch_first=True,
            dropout=0.0,
        )
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Tensor of shape (batch, LOOKBACK, input_size)
        Returns:
            Tensor of shape (batch,) — predicted AQI values
        """
        out, _ = self.gru(x)          # (batch, LOOKBACK, hidden)
        out = out[:, -1, :]           # take last timestep: (batch, hidden)
        return self.fc(out).squeeze(-1)  # (batch,)
