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
  require("leaflet-draw"); // ✅ IMPORTANTE: carrega o JS do draw
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
    // ✅ corrige ícone padrão
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = icon;
  }, []);

  function onCreated(e) {
    const latlngs = e.layer.getLatLngs()[0];
    setPoly(latlngs.map((p) => [p.lat, p.lng]));
    setPontos([]);
  }

  function gerarPontos() {
    if (!poly) return;

    const ring = poly.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);

    const pol = turf.polygon([ring]);
    const bbox = turf.bbox(pol);

    const km = Math.sqrt(gridHa * 10000) / 1000;
    const grid = turf.squareGrid(bbox, km, { units: "kilometers" });

    const dentro = grid.features
      .map((f) => turf.centroid(f))
      .filter((p) => turf.booleanPointInPolygon(p, pol))
      .map((p) => [p.geometry.coordinates[1], p.geometry.coordinates[0]]);

    const step = Math.max(1, Math.floor(dentro.length / qtd));

    const sel = dentro
      .filter((_, i) => i % step === 0)
      .slice(0, qtd)
      .map((p, i) => ({
        lat: p[0],
        lng: p[1],
        n: i + 1,
        status: ["verde", "amarelo", "vermelho"][Math.floor(Math.random() * 3)],
      }));

    setPontos(sel);
  }

  function cor(status) {
    if (status === "verde") return "green";
    if (status === "amarelo") return "orange";
    return "red";
  }

  return (
    <main style={{ height: "100vh", background: "#060b08", color: "white" }}>
      {/* barra fixa em cima (pra não sumir no celular) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          padding: 10,
          background: "rgba(6,11,8,0.92)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <b>Mapa de Monitoramento</b>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            1) Clique no botão de polígono (canto direito do mapa) e desenhe o talhão.
            2) Defina grid e quantidade.
            3) Gerar pontos.
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="number"
              value={gridHa}
              onChange={(e) => setGridHa(Number(e.target.value))}
              placeholder="Grid (ha)"
              style={{ width: 120, padding: 8, borderRadius: 10 }}
            />
            <input
              type="number"
              value={qtd}
              onChange={(e) => setQtd(Number(e.target.value))}
              placeholder="Qtde pontos"
              style={{ width: 140, padding: 8, borderRadius: 10 }}
            />
            <button
              onClick={gerarPontos}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "#1fa463",
                color: "white",
                fontWeight: 700,
              }}
            >
              Gerar pontos
            </button>
            <a
              href="/produtor"
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,.08)",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Voltar
            </a>
          </div>
        </div>
      </div>

      {/* mapa */}
      <div style={{ height: "100%", paddingTop: 110 }}>
        <MapContainer center={center} zoom={14} style={{ height: "100%" }}>
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
                className: "ponto",
                html: `<div style="
                  background:${cor(p.status)};
                  width:14px;height:14px;border-radius:50%;
                  border:2px solid white"></div>`,
              })}
            >
              <Popup>
                <b>Ponto {p.n}</b>
                <br />
                Status: {p.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </main>
  );
}
