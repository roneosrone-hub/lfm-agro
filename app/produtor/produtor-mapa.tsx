"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Conversão aproximada (ok para grids “de campo” em áreas pequenas)
function metersToLat(m: number) {
  return m / 111_320;
}
function metersToLng(m: number, lat: number) {
  return m / (111_320 * Math.cos((lat * Math.PI) / 180));
}

export default function ProdutorMapa() {
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const satRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [gridSize, setGridSize] = useState<number>(200); // metros
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    // Ícones Leaflet no Next
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: marker2x.src,
      iconUrl: marker1x.src,
      shadowUrl: markerShadow.src,
    });

    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: true,
      attributionControl: false,
      center: [-15.78, -47.93], // centro inicial
      zoom: 5,
    });

    mapRef.current = map;

    const base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
    });

    const sat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20 }
    );

    base.addTo(map);
    baseRef.current = base;
    satRef.current = sat;

    gridLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  function setBase() {
    const map = mapRef.current;
    if (!map || !baseRef.current || !satRef.current) return;
    if (map.hasLayer(satRef.current)) map.removeLayer(satRef.current);
    if (!map.hasLayer(baseRef.current)) map.addLayer(baseRef.current);
  }

  function setSat() {
    const map = mapRef.current;
    if (!map || !baseRef.current || !satRef.current) return;
    if (map.hasLayer(baseRef.current)) map.removeLayer(baseRef.current);
    if (!map.hasLayer(satRef.current)) map.addLayer(satRef.current);
  }

  function clearGrid() {
    gridLayerRef.current?.clearLayers();
    setMsg("Grid limpo.");
  }

  function generateGrid() {
    const map = mapRef.current;
    const gridLayer = gridLayerRef.current;
    if (!map || !gridLayer) return;

    gridLayer.clearLayers();

    const bounds = map.getBounds();
    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    // passo em graus (usando latitude média do quadro)
    const midLat = (south + north) / 2;
    const stepLat = metersToLat(Math.max(10, gridSize));
    const stepLng = metersToLng(Math.max(10, gridSize), midLat);

    let count = 0;

    for (let lat = south; lat < north; lat += stepLat) {
      for (let lng = west; lng < east; lng += stepLng) {
        const rectBounds: L.LatLngBoundsExpression = [
          [lat, lng],
          [Math.min(lat + stepLat, north), Math.min(lng + stepLng, east)],
        ];

        const r = L.rectangle(rectBounds, {
          weight: 1,
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.12,
        });

        r.on("click", () => {
          const b = r.getBounds();
          const c = b.getCenter();
          setMsg(
            `Quadrante: centro ${c.lat.toFixed(6)}, ${c.lng.toFixed(6)} | SW ${b.getSouthWest().lat.toFixed(
              6
            )}, ${b.getSouthWest().lng.toFixed(6)}`
          );
        });

        r.addTo(gridLayer);
        count++;
      }
    }

    setMsg(`Grid gerado (${count} quadrantes) com ${gridSize} m (na área visível).`);
  }

  function myLocation() {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      setMsg("Geolocalização não disponível.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 17);

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude]).addTo(map);
        }

        setMsg(`Meu local: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      () => setMsg("Não consegui pegar sua localização (permissão negada ou sinal fraco)."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />

      {/* Painel por cima do mapa (z-index alto) */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "rgba(255,255,255,0.92)",
          padding: 10,
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          width: 180,
        }}
      >
        <button onClick={setBase} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          🗺️ Mapa
        </button>
        <button onClick={setSat} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          🛰️ Satélite
        </button>
        <button onClick={myLocation} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          📍 Meu local
        </button>

        <div style={{ marginTop: 6, borderTop: "1px solid #e5e5e5", paddingTop: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Grid (metros)</div>
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value || 200))}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={generateGrid}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #16a34a",
                background: "#16a34a",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Gerar
            </button>
            <button
              onClick={clearGrid}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      {msg ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: "10px 12px",
            borderRadius: 10,
            maxWidth: "90%",
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      ) : null}
    </div>
  );
}
