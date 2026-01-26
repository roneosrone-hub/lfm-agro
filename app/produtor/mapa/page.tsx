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
        <h2>Mapa de Monitoramento</h2>
        <p>Desenhe o talhão, defina o grid (ha) e a quantidade de pontos.</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <input type="number" value={gridHa} onChange={(e) => setGridHa(Number(e.target.value))} placeholder="Grid ha" />
          <input type="number" value={qtdPontos} onChange={(e) => setQtdPontos(Number(e.target.value))} placeholder="Qtde pontos" />
          <button onClick={gerarPontos}>Gerar pontos</button>
          <a href="/pro">Voltar</a>
        </div>

        <div style={{ height: "75vh" }}>
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
