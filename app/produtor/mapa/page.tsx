"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapaProdutorClient = dynamic(() => Promise.resolve(MapaProdutorInner), {
  ssr: false,
});

export default function Page() {
  return <MapaProdutorClient />;
}

/* ---------------- CLIENT (sem SSR) ---------------- */

function MapaProdutorInner() {
  const React = require("react") as typeof import("react");
  const { useEffect, useMemo, useRef, useState } = React;

  const turf = require("@turf/turf") as typeof import("@turf/turf");

  const {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
  } = require("react-leaflet") as typeof import("react-leaflet");

  const { FeatureGroup } = require("react-leaflet") as typeof import("react-leaflet");
  const { EditControl } = require("react-leaflet-draw") as any;

  const L = require("leaflet") as typeof import("leaflet");

  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    (L.Marker as any).prototype.options.icon = DefaultIcon;
  }, []);

  type LatLng = [number, number];
  type Ponto = { id: string; lat: number; lng: number; n: number };

  const center = useMemo<LatLng>(() => [-15.60, -56.10], []);
  const fgRef = useRef<any>(null);

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);
  const [areaHa, setAreaHa] = useState<number>(0);

  const [gridHa, setGridHa] = useState<number>(10);
  const [qtdPontos, setQtdPontos] = useState<number>(30);

  const [pontos, setPontos] = useState<Ponto[]>([]);

  function onCreated(e: any) {
    if (e.layerType !== "polygon") return;

    const latlngs = e.layer.getLatLngs()[0].map((p: any) => [p.lat, p.lng]);
    setPolyLatLngs(latlngs);
  }

  useEffect(() => {
    if (!polyLatLngs || polyLatLngs.length < 3) return;

    const poly = turf.polygon([[...polyLatLngs, polyLatLngs[0]]]);
    const areaM2 = turf.area(poly);
    const areaHaCalc = areaM2 / 10000;

    setAreaHa(areaHaCalc);

    const bbox = turf.bbox(poly);
    const cellSide = Math.sqrt(gridHa * 10000);

    const grid = turf.pointGrid(bbox, cellSide, { units: "meters" });

    const dentro = grid.features.filter((pt: any) =>
      turf.booleanPointInPolygon(pt, poly)
    );

    let pts = dentro.slice(0, qtdPontos).map((pt: any, i: number) => ({
      id: crypto.randomUUID(),
      lat: pt.geometry.coordinates[1],
      lng: pt.geometry.coordinates[0],
      n: i + 1,
    }));

    setPontos(pts);

    // ⚠️ AQUI FOI A CORREÇÃO PRINCIPAL
    const fc = turf.featureCollection<any>([
      poly,
      ...dentro.slice(0, qtdPontos),
    ]);

    console.log("GeoJSON:", fc);
  }, [polyLatLngs, gridHa, qtdPontos]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Mapa do Produtor</h1>
          <div style={styles.sub}>Talhão, área, grids e pontos amostrais</div>
        </div>
        <a href="/produtor" style={styles.back}>← Voltar</a>
      </header>

      <div style={styles.info}>
        <div>Área: <b>{areaHa.toFixed(2)} ha</b></div>

        <div>
          Grid (ha):
          <input type="number" value={gridHa}
            onChange={e => setGridHa(Number(e.target.value))}
            style={styles.input}
          />
        </div>

        <div>
          Pontos:
          <input type="number" value={qtdPontos}
            onChange={e => setQtdPontos(Number(e.target.value))}
            style={styles.input}
          />
        </div>

        <div>Pontos criados: <b>{pontos.length}</b></div>
      </div>

      <div style={styles.mapWrap}>
        <MapContainer center={center} zoom={6} style={styles.map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <FeatureGroup ref={fgRef}>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: true,
              }}
            />
          </FeatureGroup>

          {polyLatLngs && (
            <Polygon positions={polyLatLngs} pathOptions={{ color: "#22c55e" }} />
          )}

          {pontos.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                Ponto {p.n} <br />
                Lat: {p.lat.toFixed(5)} <br />
                Lng: {p.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </main>
  );
}

const styles: any = {
  page: { minHeight: "100vh", background: "#070b12", color: "white", padding: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0 },
  sub: { opacity: 0.7, marginTop: 4 },
  back: { color: "white", textDecoration: "none", opacity: 0.8 },
  info: { display: "flex", gap: 14, flexWrap: "wrap", margin: "12px 0", opacity: 0.9 },
  input: { marginLeft: 6, width: 80 },
  mapWrap: { height: "75vh", borderRadius: 12, overflow: "hidden" },
  map: { height: "100%", width: "100%" },
};
