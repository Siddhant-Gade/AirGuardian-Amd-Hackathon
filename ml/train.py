"""
ml/train.py

Full GRU training loop.

Usage:
    python ml/train.py

Expected outputs:
    ml/artifacts/model.pt
    ml/artifacts/scaler.pkl
    ml/artifacts/feature_columns.json
"""
from __future__ import annotations

import json
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from config import FEATURE_COLS, ML_ARTIFACTS_DIR
from ml.model import AQIPredictor
from ml.data_loader import load_cpcb, load_weather
from ml.data_cleaner import clean_aqi_data, clean_weather_data, merge_and_save
from ml.feature_scaler import fit_and_save
from ml.sequence_generator import build_sequences, train_val_split

ARTIFACTS_DIR = Path(ML_ARTIFACTS_DIR)
EPOCHS        = 100
BATCH_SIZE    = 64
LR            = 5e-4


def train() -> None:
    # ------------------------------------------------------------------
    # 1. Load raw data from data/raw/
    # ------------------------------------------------------------------
    cpcb_df    = load_cpcb()
    weather_df = load_weather()

    # ------------------------------------------------------------------
    # 2. Clean each source independently
    # ------------------------------------------------------------------
    cpcb_clean    = clean_aqi_data(cpcb_df)
    weather_clean = clean_weather_data(weather_df)

    # ------------------------------------------------------------------
    # 3. Merge AQI + weather into the 6-feature training DataFrame
    #    and save to data/processed/merged_dataset.csv
    # ------------------------------------------------------------------
    merged_df = merge_and_save(cpcb_clean, weather_clean)
    print(f"Merged dataset: {merged_df.shape[0]} rows, {merged_df.shape[1]} cols")

    # ------------------------------------------------------------------
    # 4. Fit scaler (saves scaler.pkl) and build sequences
    # ------------------------------------------------------------------
    scaled_df          = fit_and_save(merged_df.reset_index().copy())
    X, y               = build_sequences(scaled_df)
    X_train, y_train, X_val, y_val = train_val_split(X, y)

    print(f"Train: {X_train.shape}  Val: {X_val.shape}")

    # ------------------------------------------------------------------
    # 5. Training setup
    # ------------------------------------------------------------------
    device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    model     = AQIPredictor().to(device)
    criterion = nn.HuberLoss(delta=1.0)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=20, gamma=0.5)

    X_t = torch.FloatTensor(X_train).to(device)
    y_t = torch.FloatTensor(y_train).to(device)
    X_v = torch.FloatTensor(X_val).to(device)
    y_v = torch.FloatTensor(y_val).to(device)

    loader        = DataLoader(TensorDataset(X_t, y_t), batch_size=BATCH_SIZE, shuffle=True)
    best_val_loss = float("inf")

    # ------------------------------------------------------------------
    # 6. Training loop
    # ------------------------------------------------------------------
    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        for X_batch, y_batch in loader:
            optimizer.zero_grad()
            pred = model(X_batch)
            loss = criterion(pred, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item()

        model.eval()
        with torch.no_grad():
            val_pred = model(X_v)
            val_mae  = torch.mean(torch.abs(val_pred - y_v)).item()
            val_loss = criterion(val_pred, y_v).item()

        scheduler.step()

        if epoch % 10 == 0:
            print(f"Epoch {epoch:3d} | Train Loss: {train_loss / len(loader):.3f} | Val MAE: {val_mae:.2f} AQI units")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), ARTIFACTS_DIR / "model.pt")

    # ------------------------------------------------------------------
    # 7. Save feature column order (critical for inference)
    # ------------------------------------------------------------------
    with open(ARTIFACTS_DIR / "feature_columns.json", "w") as f:
        json.dump(FEATURE_COLS, f)

    print(f"\n✅ Training complete. Best Val MAE: {val_mae:.2f} AQI units")
    print("   Saved: model.pt | scaler.pkl | feature_columns.json")


if __name__ == "__main__":
    train()
