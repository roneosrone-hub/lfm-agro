// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";
import "@geoman-io/leaflet-geoman-free"; // opcional, não quebra se não tiver
import "leaflet-geoman-free/dist/leaflet-geoman.css"; // opcional

import { MapContainer, TileLayer, Polygon, Marker, Popup, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import * as turf from "@turf/turf";

type LatLng = [number, number];

type CellStatus = "ok" | "alerta" | "critico";

type GridCell = {
  id: string;
  polygonLatLngs: LatLng[]; // para desenhar no Leaflet
  center: LatLng; // marcador/label
  status: CellStatus;
  n: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function statusColor(status: CellStatus) {
  // verde / amarelo / vermelho (com transparência)
  if (status === "ok") return { fill: "rgba(0, 200, 70, 0.35)", stroke: "rgba(0, 200, 70, 0.8)" };
  if (status === "alerta") return { fill: "rgba(255, 200, 0, 0.35)", stroke: "rgba(255, 200, 0, 0.85)" };
  return { fill: "rgba(255, 60, 60, 0.35)", stroke: "rgba(255, 60, 60, 0.85)" };
}

export default function Page() {
  const center = useMemo<LatLng>(() => [-15.60, -56.10], []);
  const [modo, setModo] = useState<"mapa" | "satelite">("satelite");

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);

  // “grid” aqui é tamanho da célula em hectares
  const [gridHa, setGridHa] = useState<number>(10);

  // se quiser também limitar a quantidade de células, deixa isso
  const [limiteCelulas, setLimiteCelulas] = useState<number>(9999);

  const [gridCells, setGridCells] = useState<GridCell[]>([]);

  // localização do usuário
  const [meuLocal, setMeuLocal] = useState<LatLng | null>(null);

  // corrige ícone padrão do Leaflet no Next
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  function onCreated(e: any) {
    // usuário desenhou o polígono
    const layer = e.layer;
    const latlngs = layer.getLatLngs()?.[0] || [];
    const pts: LatLng[] = latlngs.map((p: any) => [p.lat, p.lng]);
    setPolyLatLngs(pts);
    setGridCells([]); // reseta grid quando redesenha talhão
  }

  function limparTudo() {
    setPolyLatLngs(null);
    setGridCells([]);
  }

  function gerarGrid() {
    if (!polyLatLngs || polyLatLngs.length < 3) return;

    // turf usa [lng, lat]
    const ring = polyLatLngs.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);

    const talhao = turf.polygon([ring]);
    const bbox = turf.bbox(talhao);

    // converte hectares para “lado” aproximado da célula (quadrada)
    // área(ha) -> m² (1ha = 10.000 m²)
    // lado = sqrt(area_m2)
    // em km:
    const cellSideKm = Math.sqrt(gridHa * 10000) / 1000;

    // cria grid quadrado
    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    // filtra células que intersectam o talhão
    const cellsInside = grid.features
      .filter((f: any) => turf.booleanIntersects(f, talhao))
      .slice(0, Math.max(1, limiteCelulas));

    const out: GridCell[] = cellsInside.map((cell: any, idx: number) => {
      const coords = cell.geometry.coordinates[0]; // [ [lng,lat], ... ]
      const latlngs: LatLng[] = coords.map((c: any) => [c[1], c[0]]);

      const ctd = turf.centroid(cell);
      const cLat = ctd.geometry.coordinates[1];
      const cLng = ctd.geometry.coordinates[0];

      return {
        id: uid(),
        polygonLatLngs: latlngs,
        center: [cLat, cLng],
        status: "ok",
        n: idx + 1,
      };
    });

    setGridCells(out);
  }

  function cycleStatus(cellId: string) {
    // clica na célula para alternar: ok -> alerta -> critico -> ok
    setGridCells((prev) =>
      prev.map((c) => {
        if (c.id !== cellId) return c;
        const next: CellStatus = c.status === "ok" ? "alerta" : c.status === "alerta" ? "critico" : "ok";
        return { ...c, status: next };
      })
    );
  }

  function pegarMeuLocal() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMeuLocal([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0f12", color: "white", padding: 12 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h2 style={{ margin: "6px 0 2px", fontSize: 26 }}>Mapa de Monitoramento</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          1) Desenhe o talhão (polígono). 2) Defina o grid (ha). 3) Clique em “Gerar grid”. 4) Clique nas células para marcar:
          <b> Verde</b> (ok) → <b>Amarelo</b> (alerta) → <b>Vermelho</b> (crítico).
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ opacity: 0.85 }}>Grid (ha)</span>
            <input
              type="number"
              value={gridHa}
              min={1}
              step={1}
              onChange={(e) => setGridHa(Number(e.target.value))}
              style={{
                width: 110,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.06)",
                color: "white",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ opacity: 0.85 }}>Limite células</span>
            <input
              type="number"
              value={limiteCelulas}
              min={10}
              step={10}
              onChange={(e) => setLimiteCelulas(Number(e.target.value))}
              style={{
                width: 140,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.06)",
                color: "white",
              }}
            />
          </div>

          <button
            onClick={gerarGrid}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(46, 204, 113, .25)",
              color: "white",
              fontWeight: 700,
            }}
          >
            Gerar grid
          </button>

          <button
            onClick={limparTudo}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(255,255,255,.06)",
              color: "white",
              fontWeight: 700,
            }}
          >
            Limpar
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={() => setModo("mapa")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.18)",
                background: modo === "mapa" ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)",
                color: "white",
                fontWeight: 700,
              }}
            >
              🗺️ Mapa
            </button>
            <button
              onClick={() => setModo("satelite")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.18)",
                background: modo === "satelite" ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)",
                color: "white",
                fontWeight: 700,
              }}
            >
              🛰️ Satélite
            </button>
            <button
              onClick={pegarMeuLocal}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.18)",
                background: "rgba(255,255,255,.06)",
                color: "white",
                fontWeight: 700,
              }}
            >
              📍 Meu local
            </button>
          </div>
        </div>

        <div style={{ height: "76vh", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}>
          <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
            {modo === "mapa" ? (
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            ) : (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            )}

            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={onCreated}
                draw={{
                  polygon: true,
                  rectangle: false,
                  circle: false,
                  marker: false,
                  polyline: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>

            {/* talhão */}
            {polyLatLngs && (
              <Polygon
                positions={polyLatLngs}
                pathOptions={{ color: "rgba(0,255,140,.9)", weight: 3, fillColor: "rgba(0,255,140,.12)", fillOpacity: 0.2 }}
              />
            )}

            {/* grids */}
            {gridCells.map((c) => {
              const col = statusColor(c.status);
              return (
                <Polygon
                  key={c.id}
                  positions={c.polygonLatLngs}
                  eventHandlers={{
                    click: () => cycleStatus(c.id),
                  }}
                  pathOptions={{
                    color: col.stroke,
                    weight: 2,
                    fillColor: col.fill,
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <b>Célula {c.n}</b>
                      <div>Status: {c.status === "ok" ? "🟢 OK" : c.status === "alerta" ? "🟡 Alerta" : "🔴 Crítico"}</div>
                      <div style={{ marginTop: 8, opacity: 0.85 }}>Clique na área para alternar (OK → Alerta → Crítico).</div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* marcador do meu local */}
            {meuLocal && (
              <Marker position={meuLocal}>
                <Popup>📍 Meu local</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
