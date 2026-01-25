// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapaProdutorClient = dynamic(() => Promise.resolve(MapaProdutorInner), { ssr: false });

export default function Page() {
  return <MapaProdutorClient />;
}

function MapaProdutorInner() {
  const React = require("react") as typeof import("react");
  const { useEffect, useMemo, useRef, useState } = React;

  const turf = require("@turf/turf") as typeof import("@turf/turf");
  const L = require("leaflet") as typeof import("leaflet");

  const {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
    useMapEvents,
  } = require("react-leaflet") as typeof import("react-leaflet");

  const { FeatureGroup } = require("react-leaflet") as typeof import("react-leaflet");
  const { EditControl } = require("react-leaflet-draw") as any;

  type LatLng = [number, number]; // [lat, lng]
  type Ponto = { id: string; lat: number; lng: number; n: number };

  const center = useMemo<LatLng>(() => [-15.60, -56.10], []);

  const fgRef = useRef<any>(null);

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);
  const [areaHa, setAreaHa] = useState<number>(0);

  const [gridHa, setGridHa] = useState<number>(10);
  const [qtdPontos, setQtdPontos] = useState<number>(30);

  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [msg, setMsg] = useState<string>("1) Desenhe o talhão. 2) Escolha grid (ha) e quantidade. 3) Gerar pontos.");

  // Corrige ícones do Leaflet no Vercel
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    (L.Marker as any).prototype.options.icon = DefaultIcon;
  }, [L]);

  function onCreated(e: any) {
    // pega o primeiro polígono desenhado
    const layer = e.layer;
    const latlngs = layer.getLatLngs?.()?.[0] || layer.getLatLngs?.() || [];
    const arr: LatLng[] = latlngs.map((x: any) => [x.lat, x.lng]);

    if (!arr || arr.length < 3) return;

    setPolyLatLngs(arr);
    setPontos([]);

    // área (ha)
    const poly = latLngsToTurfPolygon(arr);
    const areaM2 = turf.area(poly);
    setAreaHa(Math.max(0, areaM2 / 10000));
    setMsg("Talhão desenhado. Agora clique em “Gerar pontos” para criar o grid/pontos.");
  }

  function onDeleted() {
    setPolyLatLngs(null);
    setAreaHa(0);
    setPontos([]);
    setMsg("Talhão apagado. Desenhe novamente.");
  }

  function latLngsToTurfPolygon(latlngs: LatLng[]) {
    // turf usa [lng, lat]
    const ring = latlngs.map(([lat, lng]) => [lng, lat]);
    // fecha o anel
    if (ring.length > 0) ring.push(ring[0]);
    return turf.polygon([ring]);
  }

  function gerarPontos() {
    if (!polyLatLngs || polyLatLngs.length < 3) {
      setMsg("Desenhe o talhão primeiro (ferramenta do polígono).");
      return;
    }

    const poly = latLngsToTurfPolygon(polyLatLngs);
    const bbox = turf.bbox(poly);

    // converte gridHa (ha) para lado aproximado do quadrado (m)
    // 1 ha = 10.000 m² -> lado = sqrt(ha*10000)
    const cellSideMeters = Math.max(10, Math.sqrt(Math.max(0.1, gridHa) * 10000));

    // squareGrid em km
    const cellSideKm = cellSideMeters / 1000;

    const grid = turf.squareGrid(bbox, cellSideKm, { units: "kilometers" });

    // pega centros dos quadrados que caem dentro do polígono
    const candidatos: LatLng[] = [];
    for (const f of grid.features) {
      const c = turf.centroid(f);
      if (turf.booleanPointInPolygon(c, poly)) {
        const [lng, lat] = c.geometry.coordinates;
        candidatos.push([lat, lng]);
      }
    }

    if (candidatos.length === 0) {
      setMsg("Não consegui gerar pontos dentro do talhão. Ajuste grid (ha) e tente novamente.");
      return;
    }

    // escolhe N pontos “espalhados” pegando intervalos
    const N = Math.max(1, Math.min(qtdPontos, candidatos.length));
    const step = Math.max(1, Math.floor(candidatos.length / N));

    const selecionados: LatLng[] = [];
    for (let i = 0; i < candidatos.length && selecionados.length < N; i += step) {
      selecionados.push(candidatos[i]);
    }
    // garante N
    while (selecionados.length < N) selecionados.push(candidatos[selecionados.length % candidatos.length]);

    const pts: Ponto[] = selecionados.map(([lat, lng], idx) => ({
      id: `${Date.now()}-${idx}`,
      lat,
      lng,
      n: idx + 1,
    }));

    setPontos(pts);
    setMsg(`Gerado: ${pts.length} pontos. Grid ~ ${gridHa} ha (aprox).`);
  }

  function limpar() {
    setPontos([]);
    setMsg("Pontos limpos. Você pode gerar novamente.");
  }

  function exportarGeoJSON() {
    if (!polyLatLngs) {
      setMsg("Desenhe o talhão primeiro.");
      return;
    }
    const poly = latLngsToTurfPolygon(polyLatLngs);

    const featPts = pontos.map((p) =>
      turf.point([p.lng, p.lat], { n: p.n, lat: p.lat, lng: p.lng })
    );

    const fc = turf.featureCollection([
      turf.feature(poly.geometry, { tipo: "talhao", area_ha: Number(areaHa.toFixed(2)) }),
      ...featPts,
    ]);

    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talhao_pontos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.geojson`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setMsg("Exportado GeoJSON (talhão + pontos).");
  }

  const styles: any = {
    page: { minHeight: "100vh", padding: 14, color: "white" },
    shell: {
      maxWidth: 980,
      margin: "0 auto",
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      boxShadow: "0 20px 60px rgba(0,0,0,.35)",
      overflow: "hidden",
    },
    header: { padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
    title: { fontSize: 18, fontWeight: 800, letterSpacing: 0.3 },
    sub: { fontSize: 13, opacity: 0.75, marginTop: 2 },
    panel: { padding: 14, display: "grid", gridTemplateColumns: "1fr", gap: 10 },
    controls: {
      display: "grid",
      gap: 10,
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    card: {
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      borderRadius: 16,
      padding: 12,
    },
    label: { fontSize: 12, opacity: 0.75, marginBottom: 6 },
    input: {
      width: "100%",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(0,0,0,.18)",
      color: "white",
      padding: "10px 12px",
      outline: "none",
      fontSize: 14,
    },
    btnRow: { display: "flex", gap: 10, flexWrap: "wrap" },
    btn: {
      borderRadius: 14,
      padding: "12px 14px",
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnGreen: {
      borderRadius: 14,
      padding: "12px 14px",
      border: "1px solid rgba(124,196,90,.35)",
      background: "rgba(124,196,90,.22)",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },
    mapWrap: {
      height: "70vh",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,.14)",
    },
    footer: { padding: 14, fontSize: 13, opacity: 0.8, borderTop: "1px solid rgba(255,255,255,.10)" },
    badge: {
      display: "inline-flex",
      gap: 10,
      alignItems: "center",
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      fontSize: 13,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Mapa • Produtor</div>
            <div style={styles.sub}>Desenhe o talhão, escolha o grid em hectares e gere pontos amostrais numerados.</div>
          </div>
          <div style={styles.badge}>
            <span>Área:</span>
            <strong>{areaHa ? `${areaHa.toFixed(2)} ha` : "-"}</strong>
            <span>•</span>
            <strong>{pontos.length} pontos</strong>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.controls}>
            <div style={styles.card}>
              <div style={styles.label}>Tamanho do grid (hectares por célula)</div>
              <input
                style={styles.input}
                type="number"
                step="0.5"
                value={gridHa}
                onChange={(e) => setGridHa(Number(e.target.value || 0))}
              />
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Quantidade de pontos desejada</div>
              <input
                style={styles.input}
                type="number"
                step="1"
                value={qtdPontos}
                onChange={(e) => setQtdPontos(Number(e.target.value || 0))}
              />
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnGreen} onClick={gerarPontos}>
              Gerar pontos
            </button>
            <button style={styles.btn} onClick={limpar}>
              Limpar pontos
            </button>
            <button style={styles.btn} onClick={exportarGeoJSON}>
              Exportar GeoJSON
            </button>
            <a href="/produtor" style={{ ...styles.btn, display: "inline-flex", alignItems: "center" }}>
              ← Voltar
            </a>
          </div>

          <div style={styles.mapWrap}>
            <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FeatureGroup ref={fgRef}>
                <EditControl
                  position="topright"
                  onCreated={onCreated}
                  onDeleted={onDeleted}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: {
                      allowIntersection: false,
                      showArea: true,
                    },
                  }}
                  edit={{
                    edit: false,
                    remove: true,
                  }}
                />
              </FeatureGroup>

              {polyLatLngs && <Polygon positions={polyLatLngs as any} />}

              {pontos.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <strong>Ponto {p.n}</strong>
                    <br />
                    Lat: {p.lat.toFixed(6)}
                    <br />
                    Lng: {p.lng.toFixed(6)}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div style={styles.footer}>{msg}</div>
      </div>
    </div>
  );
}
