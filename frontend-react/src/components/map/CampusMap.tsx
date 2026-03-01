/* ── CampusMap — Leaflet map with color-coded labeled zone markers ── */

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ZoneMap } from "../../types";
import { getSeverityColor } from "../../types";

interface Props {
  zones: ZoneMap | null;
  selectedZone: string | null;
  onSelectZone: (name: string) => void;
}

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 17, { duration: 0.8 });
  }, [lat, lon, map]);
  return null;
}

export default function CampusMap({ zones, selectedZone, onSelectZone }: Props) {
  const entries = zones ? Object.entries(zones) : [];
  const selected = selectedZone && zones?.[selectedZone];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Inline keyframes for pulse ring */}
      <style>{`
        @keyframes mapPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .zone-pulse {
          animation: mapPulse 2.2s ease-out infinite;
          border-radius: 50%;
          position: absolute;
          inset: 0;
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip::before { display: none !important; }
        .zone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          pointer-events: none;
        }
        .zone-label-aqi {
          font-size: 13px;
          font-weight: 800;
          font-family: -apple-system, sans-serif;
          line-height: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .zone-label-name {
          font-size: 10px;
          font-weight: 600;
          font-family: -apple-system, sans-serif;
          background: rgba(255,255,255,0.92);
          padding: 1px 5px;
          border-radius: 3px;
          white-space: nowrap;
          text-shadow: none;
          color: #1a1a18;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
      `}</style>

      <MapContainer
        center={[21.1463, 79.0885]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {selected && <FlyTo lat={selected.lat} lon={selected.lon} />}

        {entries.map(([name, data]) => {
          const colors = getSeverityColor(data.severity);
          const isSelected = selectedZone === name;
          const aqi = Math.round(data.predicted_aqi);
          const isAlert = aqi >= 200;

          return (
            <CircleMarker
              key={name}
              center={[data.lat, data.lon]}
              radius={isSelected ? 20 : 15}
              pathOptions={{
                fillColor: colors.dot,
                fillOpacity: isSelected ? 1 : 0.85,
                color: "#ffffff",
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{ click: () => onSelectZone(name) }}
            >
              {/* Always-on label showing AQI + zone name */}
              <Tooltip
                permanent
                direction="top"
                offset={[0, -(isSelected ? 22 : 17)]}
                className="zone-tooltip"
              >
                <div className="zone-label">
                  <span
                    className="zone-label-aqi"
                    style={{ color: colors.dot }}
                  >
                    {aqi}
                  </span>
                  {isSelected && (
                    <span className="zone-label-name">{name}</span>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      {entries.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 1000,
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #e4e4dc",
            borderRadius: 8,
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 10,
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {[
            { label: "Good",         color: "#22c55e" },
            { label: "Moderate",     color: "#eab308" },
            { label: "Poor",         color: "#f97316" },
            { label: "Very Poor",    color: "#ef4444" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color: "#3d3d38" }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
