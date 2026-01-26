// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import React from "react";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const MapaProdutorClient = dynamic(() => Promise.resolve(MapaProdutorInner), {
  ssr: false,
});

export default function Page() {
  return <MapaProdutorClient />;
}

function MapaProdutorInner() {
  const React = require("react");
  const { useEffect, useMemo, useState } = React;

  const turf = require("@turf/turf");
  const L = require("leaflet");

  const { MapContainer, TileLayer, Polygon, Marker, Popup, GeoJSON } =
    require("react-leaflet");
  const { FeatureGroup } = require("react-leaflet");
  const { EditControl } = require("react-leaflet-draw");

  type LatLng = [number, number];

  const center = useMemo(() => [-15.60, -56.10], []);

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);
  const [pontos, setPontos] = useState<any[]>([]);
  const [gridHa, setGridHa] = useState(10);
  const [qtdPontos, setQtdPontos] = useState(30);

  // Para mostrar o grid (as linhas/células)
  const [gridGeo, setGridGeo] = useState<any>(null);

  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  function onCreated(e: any) {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    setPolyLatLngs(latlngs.map((p: any) => [p.lat, p.lng]));
    setPontos([]);
    setGridGeo(null);
  }

  function onDeleted() {
    setPolyLatLngs(null);
    setPontos([]);
    setGridGeo(null);
  }

  function gerarPontos() {
    if (!polyLatLngs) return;

    // Leaflet usa [lat,lng], Turf usa [lng,lat]
    const ring = polyLatLngs.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);

    const poly = turf.polygon([ring]);
    const bbox = turf.bbox(poly);

    // gridHa (hectares) -> lado do quadrado em km
    const cellSideKm = Math.sqrt(gridHa * 10000) / 1000;

    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    // Guardar o grid pra desenhar (opcional)
    setGridGeo(grid);

    // pega centróides que ficam dentro do polígono
    const dentro = grid.features
      .map((f: any) => turf.centroid(f))
      .filter((p: any) => turf.booleanPointInPolygon(p, poly))
      .map((p: any) => [p.geometry.coordinates[1], p.geometry.coordinates[0]]); // volta pra [lat,lng]

    const step = Math.max(1, Math.floor(dentro.length / qtdPontos));
    const selecionados = dentro
      .filter((_: any, i: number) => i % step === 0)
      .slice(0, qtdPontos);

    setPontos(selecionados.map((p: any, i: number) => ({ lat: p[0], lng: p[1], n: i + 1 })));
  }

  return (
    <main style={{ minHeight: "100vh", padding: 12, background: "#0b0f12", color: "white" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 6 }}>Mapa de Monitoramento</h2>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          1) Desenhe o talhão (polígono). 2) Defina o grid (ha) e quantos pontos. 3) Clique em “Gerar pontos”.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.85 }}>Grid (ha)</label>
            <input
              type="number"
              value={gridHa}
              onChange={(e) => setGridHa(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #2a2f35", background: "#0f1418", color: "white", width: 140 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.85 }}>Qtde pontos</label>
            <input
              type="number"
              value={qtdPontos}
              onChange={(e) => setQtdPontos(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #2a2f35", background: "#0f1418", color: "white", width: 140 }}
            />
          </div>

          <button
            onClick={gerarPontos}
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #1f3a2a", background: "#16301f", color: "white", fontWeight: 700, alignSelf: "end" }}
          >
            Gerar pontos
          </button>

          <a
            href="/pro"
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #2a2f35", background: "#0f1418", color: "white", fontWeight: 700, textDecoration: "none", alignSelf: "end" }}
          >
            Voltar
          </a>
        </div>

        <div style={{ height: "75vh", borderRadius: 14, overflow: "hidden", border: "1px solid #1e242a" }}>
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={onCreated}
                onDeleted={onDeleted}
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

            {/* Desenha o grid (as células) */}
            {gridGeo && (
              <GeoJSON
                data={gridGeo}
                style={() => ({
                  weight: 1,
                  opacity: 0.6,
                  fillOpacity: 0.0,
                })}
              />
            )}

            {polyLatLngs && <Polygon positions={polyLatLngs} />}
            {pontos.map((p: any, i: number) => (
              <Marker key={i} position={[p.lat, p.lng]}>
                <Popup>Ponto {p.n}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
