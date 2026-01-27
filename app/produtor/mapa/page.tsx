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

  const {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
    GeoJSON,
    ZoomControl,
  } = require("react-leaflet");
  const { FeatureGroup } = require("react-leaflet");
  const { EditControl } = require("react-leaflet-draw");

  type LatLng = [number, number];

  const center = useMemo(() => [-15.60, -56.10], []);

  // Talhão desenhado (lat/lng)
  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);

  // Pontos (com status)
  // status: "ok" | "alerta" | "critico"
  const [pontos, setPontos] = useState<any[]>([]);

  // Parâmetros
  const [gridHa, setGridHa] = useState(10);
  const [qtdPontos, setQtdPontos] = useState(30);

  // Camada de zonas (Voronoi recortado no talhão)
  const [zonas, setZonas] = useState<any>(null);

  // ====== ÍCONES CORES (VERDE / AMARELO / VERMELHO) ======
  const iconBase = (color: string) =>
    L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;height:18px;border-radius:50%;
          background:${color};
          border:2px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.35);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

  const iconOk = useMemo(() => iconBase("#22c55e"), []);
  const iconAlerta = useMemo(() => iconBase("#eab308"), []);
  const iconCritico = useMemo(() => iconBase("#ef4444"), []);
  const iconNeutro = useMemo(() => iconBase("#60a5fa"), []);

  // ====== Leaflet default icon (se precisar) ======
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

  // ====== Converter talhão para GeoJSON polygon (lng/lat) ======
  function getTalhaoPolygon() {
    if (!polyLatLngs) return null;
    const ring = polyLatLngs.map(([lat, lng]) => [lng, lat]);
    ring.push(ring[0]);
    return turf.polygon([ring]);
  }

  // ====== Quando desenhar talhão ======
  function onCreated(e: any) {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    setPolyLatLngs(latlngs.map((p: any) => [p.lat, p.lng]));
    setPontos([]);
    setZonas(null);
  }

  // ====== GERAR PONTOS ======
  function gerarPontos() {
    const poly = getTalhaoPolygon();
    if (!poly) return;

    const bbox = turf.bbox(poly);

    // tamanho do grid em km (ha -> m² -> lado -> km)
    const cellSideKm = Math.sqrt(gridHa * 10000) / 1000;

    // faz grade quadrada e pega centroides dentro do talhão
    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    const dentro = grid.features
      .map((f: any) => turf.centroid(f))
      .filter((p: any) => turf.booleanPointInPolygon(p, poly))
      .map((p: any) => [p.geometry.coordinates[1], p.geometry.coordinates[0]]); // lat,lng

    // pega uma quantidade aproximada
    const step = Math.max(1, Math.floor(dentro.length / qtdPontos));
    const selecionados = dentro.filter((_: any, i: number) => i % step === 0).slice(0, qtdPontos);

    const pts = selecionados.map((p: any, i: number) => ({
      id: String(i + 1),
      n: i + 1,
      lat: p[0],
      lng: p[1],
      status: "ok", // começa tudo ok (você muda clicando)
    }));

    setPontos(pts);
    setZonas(null); // vai gerar depois que classificar
  }

  // ====== ATUALIZAR STATUS DE UM PONTO ======
  function setStatus(id: string, status: "ok" | "alerta" | "critico") {
    setPontos((prev: any[]) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  // ====== GERAR ZONAS COLORIDAS (VORONOI + recorte no talhão) ======
  function gerarZonas() {
    const poly = getTalhaoPolygon();
    if (!poly || pontos.length === 0) return;

    const bbox = turf.bbox(poly);

    // pontos em GeoJSON
    const fc = turf.featureCollection(
      pontos.map((p: any) =>
        turf.point([p.lng, p.lat], {
          id: p.id,
          n: p.n,
          status: p.status,
        })
      )
    );

    // Voronoi sobre bbox do talhão
    const vor = turf.voronoi(fc, { bbox });

    if (!vor) return;

    // recortar cada célula dentro do talhão
    const recortadas = vor.features
      .map((cell: any) => {
        if (!cell) return null;
        // manter props do ponto “gerador” (o turf coloca em properties geralmente)
        // mas às vezes vem vazio; então pega o mais próximo do centro da célula:
        const c = turf.centroid(cell);
        const nearest = turf.nearestPoint(c, fc);
        cell.properties = nearest.properties;

        const inter = turf.intersect(cell, poly);
        if (!inter) return null;
        inter.properties = cell.properties;
        return inter;
      })
      .filter(Boolean);

    setZonas(turf.featureCollection(recortadas));
  }

  // ====== Estilo das zonas ======
  function styleZona(feature: any) {
    const s = feature?.properties?.status;
    let fill = "#22c55e";
    if (s === "alerta") fill = "#eab308";
    if (s === "critico") fill = "#ef4444";
    return {
      color: "rgba(255,255,255,.35)",
      weight: 1,
      fillColor: fill,
      fillOpacity: 0.55,
    };
  }

  // ====== Ícone do ponto ======
  function iconDoPonto(p: any) {
    if (p.status === "ok") return iconOk;
    if (p.status === "alerta") return iconAlerta;
    if (p.status === "critico") return iconCritico;
    return iconNeutro;
  }

  const talhaoReady = !!polyLatLngs;

  return (
    <main style={{ minHeight: "100vh", padding: 12, background: "#0b0f12", color: "white" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 6 }}>Mapa de Monitoramento</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          1) Desenhe o talhão. 2) Defina grid (ha) e nº de pontos. 3) Gere pontos. 4) Classifique (🟢/🟡/🔴) e clique em “Gerar mapa”.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Grid (ha)</span>
            <input
              type="number"
              value={gridHa}
              onChange={(e) => setGridHa(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "white" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Qtde pontos</span>
            <input
              type="number"
              value={qtdPontos}
              onChange={(e) => setQtdPontos(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "white" }}
            />
          </label>

          <button
            onClick={gerarPontos}
            disabled={!talhaoReady}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(34,197,94,.35)",
              background: talhaoReady ? "rgba(34,197,94,.18)" : "rgba(255,255,255,.06)",
              color: "white",
              cursor: talhaoReady ? "pointer" : "not-allowed",
            }}
          >
            Gerar pontos
          </button>

          <button
            onClick={gerarZonas}
            disabled={!talhaoReady || pontos.length === 0}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(234,179,8,.35)",
              background: talhaoReady && pontos.length ? "rgba(234,179,8,.18)" : "rgba(255,255,255,.06)",
              color: "white",
              cursor: talhaoReady && pontos.length ? "pointer" : "not-allowed",
            }}
          >
            Gerar mapa (zonas)
          </button>

          <a
            href="/produtor"
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.16)",
              background: "rgba(255,255,255,.06)",
              color: "white",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Voltar
          </a>
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#22c55e", display: "inline-block" }} /> Tranquilo
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#eab308", display: "inline-block" }} /> Alerta
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#ef4444", display: "inline-block" }} /> Crítico
          </span>
          <span style={{ opacity: 0.75, fontSize: 12 }}>Clique no ponto para classificar.</span>
        </div>

        <div style={{ height: "75vh", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)" }}>
          <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <ZoomControl position="topleft" />

            {/* Troque aqui se quiser satélite padrão (tem limites de uso). */}
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

            {/* Talhão */}
            {polyLatLngs && <Polygon positions={polyLatLngs} pathOptions={{ color: "#22c55e", weight: 2 }} />}

            {/* Zonas (mapa colorido) */}
            {zonas && (
              <GeoJSON
                data={zonas}
                style={styleZona}
                onEachFeature={(feature: any, layer: any) => {
                  const n = feature?.properties?.n;
                  const s = feature?.properties?.status;
                  layer.bindPopup(`Zona do ponto ${n} • ${s === "ok" ? "Tranquilo" : s === "alerta" ? "Alerta" : "Crítico"}`);
                }}
              />
            )}

            {/* Pontos */}
            {pontos.map((p: any) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={iconDoPonto(p)}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <b>Ponto {p.n}</b>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
                      Status: {p.status === "ok" ? "Tranquilo" : p.status === "alerta" ? "Alerta" : "Crítico"}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => setStatus(p.id, "ok")}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(34,197,94,.4)", background: "rgba(34,197,94,.15)", color: "white" }}
                      >
                        🟢 Tranquilo
                      </button>
                      <button
                        onClick={() => setStatus(p.id, "alerta")}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(234,179,8,.4)", background: "rgba(234,179,8,.15)", color: "white" }}
                      >
                        🟡 Alerta
                      </button>
                      <button
                        onClick={() => setStatus(p.id, "critico")}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(239,68,68,.4)", background: "rgba(239,68,68,.15)", color: "white" }}
                      >
                        🔴 Crítico
                      </button>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                      Depois de classificar os pontos, clique em <b>“Gerar mapa (zonas)”</b>.
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
