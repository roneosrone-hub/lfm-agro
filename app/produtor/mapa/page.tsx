// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapaProdutorClient = dynamic(() => Promise.resolve(MapaProdutorInner), { ssr: false });

export default function Page() {
  return <MapaProdutorClient />;
}

function MapaProdutorInner() {
  const React = require("react");
  const { useEffect, useMemo, useState } = React;

  const turf = require("@turf/turf");
  const L = require("leaflet");

  const { MapContainer, TileLayer, Polygon, Marker, Popup } = require("react-leaflet");
  const { FeatureGroup } = require("react-leaflet");
  const { EditControl } = require("react-leaflet-draw");

  type LatLng = [number, number];

  const center = useMemo(() => [-15.60, -56.10], []);

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);
  const [pontos, setPontos] = useState<any[]>([]);
  const [gridHa, setGridHa] = useState(10);
  const [qtdPontos, setQtdPontos] = useState(30);

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
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    setPolyLatLngs(latlngs.map((p: any) => [p.lat, p.lng]));
  }

  function gerarPontos() {
    if (!polyLatLngs) return;

    const ring = polyLatLngs.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);

    const poly = turf.polygon([ring]);
    const bbox = turf.bbox(poly);

    // gridHa hectares => lado (m) = sqrt(ha*10.000)
    const cellSideKm = Math.sqrt(gridHa * 10000) / 1000;
    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    const dentro = grid.features
      .map((f: any) => turf.centroid(f))
      .filter((p: any) => turf.booleanPointInPolygon(p, poly))
      .map((p: any) => [p.geometry.coordinates[1], p.geometry.coordinates[0]]);

    const step = Math.max(1, Math.floor(dentro.length / qtdPontos));
    const selecionados = dentro.filter((_: any, i: number) => i % step === 0).slice(0, qtdPontos);

    setPontos(selecionados.map((p: any, i: number) => ({ lat: p[0], lng: p[1], n: i + 1 })));
  }

  return (
    <main style={{ minHeight: "100vh", padding: 12, background: "#0b0f12", color: "white" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ margin: "8px 0 6px" }}>Mapa de Monitoramento</h2>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          1) Desenhe o talhão (polígono). 2) Defina o tamanho do grid (ha) e quantos pontos. 3) Clique em “Gerar pontos”.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <label style={lbl}>
            Grid (ha)
            <input style={inp} type="number" value={gridHa} onChange={(e) => setGridHa(Number(e.target.value))} />
          </label>

          <label style={lbl}>
            Qtde pontos
            <input style={inp} type="number" value={qtdPontos} onChange={(e) => setQtdPontos(Number(e.target.value))} />
          </label>

          <button style={btn} onClick={gerarPontos}>Gerar pontos</button>
          <a style={{ ...btn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }} href="/produtor">
            Voltar
          </a>
        </div>

        <div style={{ height: "75vh", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)" }}>
          <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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

            {polyLatLngs && <Polygon positions={polyLatLngs} />}

            {pontos.map((p, i) => (
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

const lbl: any = { display: "grid", gap: 6, fontWeight: 700, fontSize: 13, opacity: 0.9 };
const inp: any = { padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "white", width: 140 };
const btn: any = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(120,200,120,.18)", color: "white", fontWeight: 800 };
