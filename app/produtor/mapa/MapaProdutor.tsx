"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Corrige ícone no Next */
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type Ponto = {
  id: string;
  lat: number;
  lng: number;
};

function ClickMapa({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapaProdutor() {
  const center = useMemo(() => [-15.601, -56.097], []);
  const [pontos, setPontos] = useState<Ponto[]>([]);

  function addPoint(lat: number, lng: number) {
    setPontos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), lat, lng },
    ]);
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🗺️ Mapa do Produtor</h1>
          <p style={styles.sub}>Toque no mapa para criar pontos</p>
        </div>

        <a href="/produtor" style={styles.back}>← Voltar</a>
      </div>

      <div style={styles.info}>
        Pontos criados: <b>{pontos.length}</b>
      </div>

      <div style={styles.mapWrap}>
        <MapContainer center={center as any} zoom={6} style={styles.map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickMapa onAdd={addPoint} />

          {pontos.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                Lat: {p.lat.toFixed(5)} <br />
                Lng: {p.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </main>
  );
}

const styles: any = {
  page: { minHeight: "100vh", background: "#070b12", color: "white", padding: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0 },
  sub: { opacity: 0.7, marginTop: 4 },
  back: { color: "white", textDecoration: "none", opacity: 0.8 },
  info: { margin: "10px 0", opacity: 0.8 },
  mapWrap: { height: "75vh", borderRadius: 12, overflow: "hidden" },
  map: { height: "100%", width: "100%" },
};
