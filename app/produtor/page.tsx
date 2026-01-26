"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones do Leaflet no Next (Vercel)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type GridCell = {
  id: string;
  bounds: L.LatLngBoundsLiteral;
  center: { lat: number; lng: number };
};

function metersToLat(m: number) {
  return m / 111_320; // aprox
}

function metersToLng(m: number, lat: number) {
  return m / (111_320 * Math.cos((lat * Math.PI) / 180));
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
      const cellSw = L.latLng(lat, lng);
      const cellNe = L.latLng(
        Math.min(lat + stepLat, ne.lat),
        Math.min(lng + stepLng, ne.lng)
      );
      const b = L.latLngBounds(cellSw, cellNe);

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

export default function ProdutorPage() {
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const satRef = useRef<L.TileLayer | null>(null);

  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [gridMeters, setGridMeters] = useState<number>(200);
  const [msg, setMsg] = useState<string>("");

  const [lastCenter, setLastCenter] = useState<L.LatLng | null>(null);
  const [lastZoom, setLastZoom] = useState<number>(5);

  const tileBase = useMemo(
    () =>
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap",
      }),
    []
  );

  const tileSat = useMemo(
    () =>
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 20, attribution: "Tiles &copy; Esri" }
      ),
    []
  );

  useEffect(() => {
    // ícones Leaflet
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: (marker2x as any).src ?? marker2x,
      iconUrl: (marker1x as any).src ?? marker1x,
      shadowUrl: (markerShadow as any).src ?? markerShadow,
    });

    if (mapRef.current) return;

    const map = L.map("map", {
      center: [-15.78, -47.93],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    baseRef.current = tileBase.addTo(map);
    satRef.current = tileSat;

    gridLayerRef.current = L.layerGroup().addTo(map);

    map.on("moveend", () => {
      setLastCenter(map.getCenter());
      setLastZoom(map.getZoom());
    });

    setLastCenter(map.getCenter());
    setLastZoom(map.getZoom());
  }, [tileBase, tileSat]);

  function setBase() {
    const map = mapRef.current!;
    if (satRef.current && map.hasLayer(satRef.current)) map.removeLayer(satRef.current);
    if (baseRef.current && !map.hasLayer(baseRef.current)) map.addLayer(baseRef.current);
  }

  function setSat() {
    const map = mapRef.current!;
    if (baseRef.current && map.hasLayer(baseRef.current)) map.removeLayer(baseRef.current);
    if (satRef.current && !map.hasLayer(satRef.current)) map.addLayer(satRef.current);
  }

  async function myLocation() {
    const map = mapRef.current!;
    setMsg("Pegando localização…");

    if (!navigator.geolocation) {
      setMsg("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const p = L.latLng(lat, lng);

        map.setView(p, Math.max(map.getZoom(), 16));

        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker(p).addTo(map).bindPopup("Meu local").openPopup();

        setMsg("Localização OK ✅");
      },
      () => setMsg("Não consegui pegar sua localização (permissão?)."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function clearGrid() {
    gridLayerRef.current?.clearLayers();
    setMsg("Grid limpo.");
  }

  function generateGrid() {
    const map = mapRef.current!;
    const step = Math.max(20, Number(gridMeters) || 200);

    gridLayerRef.current?.clearLayers();

    const b = map.getBounds();
    const cells = boundsToCells(b, step);

    const layer = gridLayerRef.current!;
    cells.forEach((cell) => {
      const rect = L.rectangle(cell.bounds, {
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.06,
      }).addTo(layer);

      rect.on("click", () => {
        const c = L.latLng(cell.center.lat, cell.center.lng);
        L.popup()
          .setLatLng(c)
          .setContent(
            `<b>Grid</b><br/>Centro:<br/>${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`
          )
          .openOn(map);
      });
    });

    setMsg(`Grid gerado: ${cells.length} células (${step} m).`);
  }

  function exportGridJSON() {
    const map = mapRef.current!;
    const step = Math.max(20, Number(gridMeters) || 200);
    const b = map.getBounds();
    const cells = boundsToCells(b, step);

    const payload = {
      stepMeters: step,
      view: { center: map.getCenter(), zoom: map.getZoom() },
      bounds: {
        southWest: b.getSouthWest(),
        northEast: b.getNorthEast(),
      },
      cells,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid_${step}m.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMsg("JSON exportado.");
  }

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: 10,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,.1)",
        }}
      >
        <button onClick={setBase}>🗺️ Mapa</button>
        <button onClick={setSat}>🛰️ Satélite</button>
        <button onClick={myLocation}>📍 Meu local</button>

        <span style={{ marginLeft: 6 }}>Grid (m):</span>
        <input
          value={gridMeters}
          onChange={(e) => setGridMeters(Number(e.target.value))}
          type="number"
          min={20}
          step={10}
          style={{ width: 90, padding: 6 }}
        />

        <button onClick={generateGrid}>🧩 Gerar grid</button>
        <button onClick={clearGrid}>🧽 Limpar</button>
        <button onClick={exportGridJSON}>📤 Exportar JSON</button>

        <span style={{ marginLeft: 8, opacity: 0.8 }}>{msg}</span>
      </div>

      <div id="map" style={{ flex: 1 }} />
    </main>
  );
}
