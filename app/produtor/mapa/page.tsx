// @ts-nocheck
"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import dynamic from "next/dynamic";
import React from "react";

const MapaClient = dynamic(() => Promise.resolve(MapaInner), { ssr: false });

export default function Page() {
  return <MapaClient />;
}

function MapaInner() {
  const React = require("react");
  const { useEffect, useMemo, useState } = React;

  const L = require("leaflet");
  require("leaflet-draw");
  const turf = require("@turf/turf");

  const {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
  } = require("react-leaflet");

  const { FeatureGroup } = require("react-leaflet");
  const { EditControl } = require("react-leaflet-draw");

  const center = useMemo(() => [-15.60, -56.10], []);

  const [poly, setPoly] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [gridHa, setGridHa] = useState(10);
  const [qtd, setQtd] = useState(30);

  useEffect(() => {
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = icon;
  }, []);

  function onCreated(e) {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    setPoly(latlngs.map((p) => [p.lat, p.lng]));
    setPontos([]);
  }

  function gerarPontos() {
    if (!poly) return alert("Desenhe o talhão primeiro.");

    const ring = poly.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);

    const polygon = turf.polygon([ring]);
    const bbox = turf.bbox(polygon);

    const cellSideKm = Math.sqrt(gridHa * 10000) / 1000;

    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    const dentro = grid.features
      .map((f) => turf.centroid(f))
      .filter((p) => turf.booleanPointInPolygon(p, polygon))
      .map((p) => [p.geometry.coordinates[1], p.geometry.coordinates[0]]);

    const step = Math.max(1, Math.floor(dentro.length / qtd));
    const selecionados = dentro.filter((_, i) => i % step === 0).slice(0, qtd);

    const pts = selecionados.map((p, i) => ({
      lat: p[0],
      lng: p[1],
      n: i + 1,
      status: "verde", // verde | amarelo | vermelho
    }));

    setPontos(pts);
  }

  function corStatus(status) {
    if (status === "vermelho") return "red";
    if (status === "amarelo") return "orange";
    return "green";
  }

  function alternarStatus(i) {
    setPontos((old) =>
      old.map((p, idx) => {
        if (idx !== i) return p;
        const next =
          p.status === "verde"
            ? "amarelo"
            : p.status === "amarelo"
            ? "vermelho"
            : "verde";
        return { ...p, status: next };
      })
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0f12", color: "white", padding: 10 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2>🗺️ Mapa de Monitoramento</h2>
        <p>Desenhe o talhão, gere os pontos e marque a pressão de pragas.</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <input
            type="number"
            value={gridHa}
            onChange={(e) => setGridHa(Number(e.target.value))}
            placeholder="Grid (ha)"
          />
          <input
            type="number"
            value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
            placeholder="Qtd pontos"
          />
          <button onClick={gerarPontos}>Gerar grides</button>
        </div>

        <div style={{ height: "75vh", borderRadius: 12, overflow: "hidden" }}>
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

            {poly && <Polygon positions={poly} pathOptions={{ color: "#00ff88" }} />}

            {pontos.map((p, i) => (
              <Marker
                key={i}
                position={[p.lat, p.lng]}
                icon={L.divIcon({
                  html: `<div style="background:${corStatus(p.status)};width:16px;height:16px;border-radius:50%;border:2px solid white"></div>`,
                })}
              >
                <Popup>
                  <b>Ponto {p.n}</b><br />
                  Status: {p.status}<br /><br />
                  <button onClick={() => alternarStatus(i)}>
                    Alterar (verde / amarelo / vermelho)
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
