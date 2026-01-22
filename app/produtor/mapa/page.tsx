"use client";

import React, { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Ponto = { id: string; lat: number; lng: number; criadoEm: number };

function ClickToAdd({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapaProdutor() {
  const center = useMemo<[number, number]>(() => [-15.601, -56.097], []);
  const [pontos, setPontos] = useState<Ponto[]>([]);

  function addPoint(lat: number, lng: number) {
    setPontos((prev) => [
      ...prev,
      { id: Math.random().toString(16).slice(2), lat, lng, criadoEm: Date.now() },
    ]);
  }

  function clearPoints() {
    setPontos([]);
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.hTitle}>🗺️ Mapa (Produtor)</div>
          <div style={styles.hSub}>Toque no mapa para criar pontos</div>
        </div>

        <a href="/produtor" style={styles.back}>
          ← Voltar
        </a>
      </div>

      <div style={styles.actions}>
        <div style={styles.badge}>Pontos: {pontos.length}</div>
        <button onClick={clearPoints} style={styles.danger}>
          🧹 Limpar
        </button>
      </div>

      <div style={styles.mapWrap}>
        <MapContainer center={center} zoom={6} style={styles.map}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToAdd onAdd={addPoint} />

          {pontos.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Ponto</div>
                <div>Lat: {p.lat.toFixed(6)}</div>
                <div>Lng: {p.lng.toFixed(6)}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <section style={styles.card}>
        <div style={styles.cardTitle}>📌 Lista</div>
        {pontos.length === 0 ? (
          <div style={styles.cardText}>Sem pontos ainda. Toque no mapa para adicionar.</div>
        ) : (
          <div style={styles.list}>
            {pontos.slice().reverse().map((p, idx) => (
              <div key={p.id} style={styles.item}>
                <div style={{ fontWeight: 900 }}>P{pontos.length - idx}</div>
                <div style={{ opacity: 0.85, fontSize: 14 }}>
                  {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% 0%, #1b2a2b, #090d10)",
    color: "#fff",
    padding: 16,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  hTitle: { fontSize: 26, fontWeight: 900, lineHeight: 1.1 },
  hSub: { opacity: 0.8, marginTop: 4 },
  back: {
    textDecoration: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 900,
  },
  danger: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255, 80, 80, 0.18)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
  },
  mapWrap: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    marginBottom: 14,
  },
  map: { width: "100%", height: "52vh", minHeight: 340 },
  card: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  cardTitle: { fontSize: 18, fontWeight: 900, marginBottom: 10 },
  cardText: { opacity: 0.85, lineHeight: 1.4 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: {
    padding: 12,
    borderRadius: 16,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
