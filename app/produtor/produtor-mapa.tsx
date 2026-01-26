"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type GridCell = {
  id: string;
  bounds: L.LatLngBoundsLiteral;
  center: { lat: number; lng: number };
};

function metersToLat(m: number) {
  return m / 111320;
}

function metersToLng(m: number, lat: number) {
  return m / (111320 * Math.cos((lat * Math.PI) / 180));
}

function boundsToCells(bounds: L.LatLngBounds, stepM: number): GridCell[] {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const stepLat = metersToLat(stepM);
  const stepLng = metersToLng(stepM, (sw.lat + ne.lat) / 2);

  const cells: GridCell[] = [];
  let id = 0;

  for (let lat = sw.lat; lat < ne.lat; lat += stepLat) {
    for (let lng = sw.lng; lng < ne.lng; lng += stepLng) {
      const b = L.latLngBounds(
        [lat, lng],
        [Math.min(lat + stepLat, ne.lat), Math.min(lng + stepLng, ne.lng)]
      );

      const c = b.getCenter();

      cells.push({
        id: String(id++),
        bounds: [b.getSouthWest(), b.getNorthEast()],
        center: { lat: c.lat, lng: c.lng },
      });
    }
  }

  return cells;
}

export default function ProdutorMapa() {
  const mapRef = useRef<L.Map | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [gridMeters, setGridMeters] = useState(200);
  const [msg, setMsg] = useState("");

  const base = useMemo(
    () => L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    []
  );

  const sat = useMemo(
    () =>
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ),
    []
  );

  useEffect(() => {
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: (marker2x as any).src ?? marker2x,
      iconUrl: (marker1x as any).src ?? marker1x,
      shadowUrl: (markerShadow as any).src ?? markerShadow,
    });

    if (mapRef.current) return;

    const map = L.map("map", {
      center: [-15.7, -55],
      zoom: 5,
    });

    base.addTo(map);

    gridLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
  }, [base]);

  function localizar() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const p = L.latLng(pos.coords.latitude, pos.coords.longitude);

      mapRef.current?.setView(p, 17);

      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker(p).addTo(mapRef.current!);
    });
  }

  function gerarGrid() {
    if (!mapRef.current || !gridLayerRef.current) return;

    gridLayerRef.current.clearLayers();

    const bounds = mapRef.current.getBounds();
    const cells = boundsToCells(bounds, gridMeters);

    cells.forEach((cell) => {
      L.rectangle(cell.bounds, {
        color: "#16a34a",
        weight: 1,
        fillOpacity: 0.08,
      })
        .addTo(gridLayerRef.current!)
        .on("click", () => {
          alert(`Centro do grid:\n${cell.center.lat}\n${cell.center.lng}`);
        });
    });

    setMsg(`Grid criado: ${cells.length} quadrantes`);
  }

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => base.addTo(mapRef.current!)}>🗺️ Mapa</button>
        <button onClick={() => sat.addTo(mapRef.current!)}>🛰️ Satélite</button>
        <button onClick={localizar}>📍 Meu local</button>

        <input
          type="number"
          value={gridMeters}
          onChange={(e) => setGridMeters(Number(e.target.value))}
          style={{ width: 90 }}
        />

        <button onClick={gerarGrid}>🧩 Gerar grid</button>

        <span>{msg}</span>
      </div>

      <div id="map" style={{ flex: 1 }} />
    </main>
  );
}
