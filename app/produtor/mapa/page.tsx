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
                <b>Ponto</b><br />
                Lat: {p.lat.toFixed(6)} <br />
                Lng: {p.lng.toFixed(6)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <section style={styles.card}>
        <div style={styles.cardTitle}>📌 Pontos salvos</div>
        {pontos.length === 0 ? (
          <div style={styles.cardText}>Nenhum ponto ainda.</div>
        ) : (
          pontos.map((p, i) => (
            <div key={p.id} style={styles.item}>
              P{i + 1} → {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
            </div>
          ))
        )}
      </section>
    </main>
  );
}

const styles: any = {
  page: { minHeight: "100vh", background: "#05080d", color: "#fff", padding: 12 },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  hTitle: { fontSize: 24, fontWeight: 900 },
  hSub: { opacity: 0.7 },
  back: { color: "#fff", textDecoration: "none", fontWeight: 800 },
  actions: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  badge: { fontWeight: 800 },
  danger: { background: "#a33", color: "#fff", borderRadius: 8, padding: "6px 10px" },
  mapWrap: { borderRadius: 12, overflow: "hidden" },
  map: { width: "100%", height: "55vh" },
  card: { marginTop: 12, padding: 12, background: "#0e141b", borderRadius: 12 },
  cardTitle: { fontWeight: 900, marginBottom: 8 },
  cardText: { opacity: 0.7 },
  item: { fontSize: 14, opacity: 0.9 },
};
