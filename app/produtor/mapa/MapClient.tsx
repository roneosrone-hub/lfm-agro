"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Corrige ícone do Leaflet no Next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MeuLocal({ setPos }: any) {
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 16);
      setPos(e.latlng);
    });
  }, [map]);

  return null;
}

export default function MapClient() {
  const [pos, setPos] = useState<any>(null);
  const [tipo, setTipo] = useState<"mapa" | "sat">("mapa");

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[-14.2, -55.9]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        {tipo === "mapa" ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
        )}

        <MeuLocal setPos={setPos} />

        {pos && (
          <Marker position={pos}>
            <Popup>📍 Você está aqui</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* CONTROLES */}
      <div
        style={{
          position: "fixed",
          top: 15,
          right: 15,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button onClick={() => setTipo("mapa")}>🗺️ Mapa</button>
        <button onClick={() => setTipo("sat")}>🛰️ Satélite</button>
        <button onClick={() => location.reload()}>📍 Meu local</button>
      </div>
    </div>
  );
}
