"""
ml/model.py — AQIPredictor GRU neural network.

2-layer GRU for 6-hour AQI forecasting.
Input  : (batch_size, 24, 6)  — 24hr lookback, 6 features
Output : (batch_size,)         — predicted AQI scalar
"""
from __future__ import annotations

import torch
import torch.nn as nn

from config import INPUT_SIZE, HIDDEN_SIZE, GRU_LAYERS, GRU_DROPOUT


class AQIPredictor(nn.Module):
    """
    2-layer stacked GRU for 6-hour AQI forecasting.

    Architecture choices:
    - 2-layer GRU — captures both short-term fluctuations and longer trends
    - Dropout between layers — prevents overfitting on training data
    - Huber loss (at training time) — handles AQI spike outliers better
      than MSE.
    """

    def __init__(
        self,
        input_size: int = INPUT_SIZE,
        hidden_size: int = HIDDEN_SIZE,
        num_layers: int = GRU_LAYERS,
        dropout: float = GRU_DROPOUT,
    ) -> None:
        super().__init__()
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
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

