"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Feature, FeatureCollection, Polygon, Position } from "geojson";
import * as turf from "@turf/turf";

const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, {
  ssr: false
});
const GeoJSON = dynamic(async () => (await import("react-leaflet")).GeoJSON, {
  ssr: false
});
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, {
  ssr: false
});
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, {
  ssr: false
});

const FeatureGroup = dynamic(
  async () => (await import("react-leaflet")).FeatureGroup,
  { ssr: false }
);

// react-leaflet-draw precisa ser carregado só no client
const EditControl = dynamic(
  async () => (await import("react-leaflet-draw")).EditControl,
  { ssr: false }
);

import L from "leaflet";

// fix ícone do marker no Next/Vercel
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

type PontoAmostral = {
  id: string;
  ordem: number;
  lat: number;
  lng: number;
};

export default function MapaProdutorGrid() {
  const center = useMemo(() => [-15.601, -56.097] as [number, number], []);

  const [talhao, setTalhao] = useState<Feature<Polygon> | null>(null);
  const [gridHa, setGridHa] = useState<number>(10); // 5 ou 10 ha
  const [qtdPontos, setQtdPontos] = useState<number>(5);
  const [gridFC, setGridFC] = useState<FeatureCollection | null>(null);
  const [pontos, setPontos] = useState<PontoAmostral[]>([]);
  const fgRef = useRef<any>(null);

  function limparTudo() {
    setTalhao(null);
    setGridFC(null);
    setPontos([]);
    try {
      const fg = fgRef.current;
      if (fg) fg.clearLayers();
    } catch {}
  }

  function gerarGridEPontos() {
    if (!talhao) {
      alert("Desenhe o talhão primeiro (polígono) no mapa.");
      return;
    }

    // 1) calcula lado do grid baseado em hectares
    // 1 ha = 10.000 m²
    const areaM2 = gridHa * 10000;
    const ladoM = Math.sqrt(areaM2); // lado aproximado (quadrado)
    const ladoKm = ladoM / 1000;

    // 2) cria grid quadrado no bbox do talhão
    const bbox = turf.bbox(talhao);
    const rawGrid = turf.squareGrid(bbox, ladoKm, { units: "kilometers" });

    // 3) recorta/filtra grid pra ficar “dentro” do talhão
    const cells: Feature[] = [];
    const centroids: { lat: number; lng: number; cell: Feature }[] = [];

    for (const cell of rawGrid.features) {
      // se o centróide estiver dentro do talhão, consideramos a célula
      const c = turf.centroid(cell);
      const inside = turf.booleanPointInPolygon(c, talhao);
      if (!inside) continue;

      // tenta intersectar pra evitar “célula passando fora”
      let clipped: any = null;
      try {
        clipped = turf.intersect(talhao as any, cell as any);
      } catch {
        clipped = null;
      }

      const finalCell = clipped ?? cell;
      cells.push(finalCell);

      const coords = c.geometry.coordinates as [number, number];
      centroids.push({
        lng: coords[0],
        lat: coords[1],
        cell: finalCell
      });
    }

    const fc: FeatureCollection = {
      type: "FeatureCollection",
      features: cells
    };
    setGridFC(fc);

    // 4) gerar pontos conforme a quantidade desejada
    // Estratégia simples e boa:
    // - se qtdPontos <= número de células: pega centróides distribuídos
    // - se qtdPontos > células: complementa com pontos aleatórios dentro do talhão

    const pontosGerados: PontoAmostral[] = [];

    if (centroids.length > 0) {
      // pega índices espaçados para distribuir
      const n = Math.min(qtdPontos, centroids.length);
      for (let i = 0; i < n; i++) {
        const idx = Math.round((i * (centroids.length - 1)) / (n - 1 || 1));
        const p = centroids[idx];
        pontosGerados.push({
          id: crypto.randomUUID(),
          ordem: i + 1,
          lat: p.lat,
          lng: p.lng
        });
      }
    }

    // se ainda falta ponto, completa aleatório dentro do polígono
    if (pontosGerados.length < qtdPontos) {
      const faltam = qtdPontos - pontosGerados.length;
      const bbox2 = turf.bbox(talhao);
      let tentativas = 0;

      while (pontosGerados.length < qtdPontos && tentativas < 5000) {
        tentativas++;
        const rp = turf.randomPoint(1, { bbox: bbox2 }).features[0];
        const ok = turf.booleanPointInPolygon(rp, talhao);
        if (!ok) continue;

        const [lng, lat] = rp.geometry.coordinates as [number, number];
        pontosGerados.push({
          id: crypto.randomUUID(),
          ordem: pontosGerados.length + 1,
          lat,
          lng
        });
      }
    }

    setPontos(pontosGerados);
  }

  // handlers do draw
  function onCreated(e: any) {
    const layer = e.layer;
    const geo = layer.toGeoJSON() as Feature<Polygon>;

    // normaliza para Polygon
    if (geo.geometry.type !== "Polygon") {
      alert("Desenhe um polígono (talhão).");
      return;
    }
    setTalhao(geo);
    setGridFC(null);
    setPontos([]);
  }

  function onEdited(e: any) {
    // pega o primeiro polígono editado
    const layers = e.layers;
    let edited: Feature<Polygon> | null = null;

    layers.eachLayer((layer: any) => {
      const g = layer.toGeoJSON() as Feature<Polygon>;
      if (g.geometry.type === "Polygon") edited = g;
    });

    if (edited) {
      setTalhao(edited);
      setGridFC(null);
      setPontos([]);
    }
  }

  function onDeleted() {
    setTalhao(null);
    setGridFC(null);
    setPontos([]);
  }

  const areaHa = useMemo(() => {
    if (!talhao) return null;
    const a = turf.area(talhao); // m²
    return a / 10000;
  }, [talhao]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.hTitle}>🗺️ Mapa • Grids & Pontos Amostrais</div>
          <div style={styles.hSub}>
            1) Desenhe o talhão (polígono) → 2) Escolha grid (ha) e nº de pontos
            → 3) Gerar
          </div>

          <div style={styles.badgesRow}>
            <span style={styles.badge}>
              Talhão: {talhao ? "OK" : "não desenhado"}
            </span>
            <span style={styles.badge}>
              Área: {areaHa ? `${areaHa.toFixed(1)} ha` : "—"}
            </span>
            <span style={styles.badge}>Grids: {gridFC?.features.length ?? 0}</span>
            <span style={styles.badge}>Pontos: {pontos.length}</span>
          </div>
        </div>

        <a href="/produtor" style={styles.back}>
          ← Voltar
        </a>
      </header>

      <section style={styles.panel}>
        <div style={styles.controls}>
          <div style={styles.controlBox}>
            <label style={styles.label}>Tamanho do grid (hectares)</label>
            <select
              value={gridHa}
              onChange={(e) => setGridHa(Number(e.target.value))}
              style={styles.select}
            >
              <option value={5}>5 ha (mais detalhado)</option>
              <option value={10}>10 ha (padrão)</option>
              <option value={20}>20 ha</option>
            </select>
          </div>

          <div style={styles.controlBox}>
            <label style={styles.label}>Quantidade de pontos a amostrar</label>
            <input
              type="number"
              value={qtdPontos}
              min={1}
              max={500}
              onChange={(e) => setQtdPontos(Number(e.target.value))}
              style={styles.input}
            />
            <div style={styles.tip}>
              Ex.: 5 pontos em 100 ha, ou 30 pontos em 100 ha
            </div>
          </div>

          <button style={styles.btnPrimary} onClick={gerarGridEPontos}>
            ✅ Gerar grids e pontos
          </button>

          <button style={styles.btnGhost} onClick={limparTudo}>
            🧹 Limpar tudo
          </button>
        </div>
      </section>

      <section style={styles.mapWrap}>
        <MapContainer
          center={center}
          zoom={12}
          style={styles.map}
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Camada de desenho */}
          <FeatureGroup ref={fgRef}>
            <EditControl
              position="topleft"
              onCreated={onCreated}
              onEdited={onEdited}
              onDeleted={onDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true
                }
              }}
              edit={{
                remove: true
              }}
            />
          </FeatureGroup>

          {/* Grid */}
          {gridFC && (
            <GeoJSON
              data={gridFC as any}
              style={() => ({
                weight: 1,
                color: "#7CFF8A",
                opacity: 0.9,
                fillColor: "#7CFF8A",
                fillOpacity: 0.08
              })}
            />
          )}

          {/* Pontos numerados */}
          {pontos.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <b>Ponto #{p.ordem}</b>
                <br />
                Lat: {p.lat.toFixed(6)}
                <br />
                Lng: {p.lng.toFixed(6)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      <footer style={styles.footer}>
        Dica: desenhe o talhão com calma (tocando os vértices). Depois clique em
        “Gerar grids e pontos”.
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 800px at 20% 0%, #234a2b 0%, #0b1020 55%, #070916 100%)",
    color: "white",
    padding: 14
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12
  },
  hTitle: { fontSize: 18, fontWeight: 800 },
  hSub: { opacity: 0.8, marginTop: 4, fontSize: 13, maxWidth: 520 },
  badgesRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  badge: {
    fontSize: 12,
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    padding: "6px 10px",
    borderRadius: 999
  },
  back: {
    color: "white",
    textDecoration: "none",
    opacity: 0.85,
    border: "1px solid rgba(255,255,255,.14)",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,.06)"
  },
  panel: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    padding: 12,
    marginBottom: 12
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10
  },
  controlBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,0,0,.18)",
    padding: 12
  },
  label: { fontSize: 12, opacity: 0.85, display: "block", marginBottom: 8 },
  select: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.14)",
    color: "white",
    outline: "none"
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.14)",
    color: "white",
    outline: "none"
  },
  tip: { marginTop: 6, fontSize: 12, opacity: 0.7 },
  btnPrimary: {
    width: "100%",
    padding: "14px 12px",
    borderRadius: 16,
    border: "1px solid rgba(124,255,138,.35)",
    background: "rgba(124,255,138,.16)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer"
  },
  btnGhost: {
    width: "100%",
    padding: "14px 12px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  },
  mapWrap: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(0,0,0,.15)",
    height: "70vh"
  },
  map: { height: "100%", width: "100%" },
  footer: { marginTop: 10, opacity: 0.7, fontSize: 12 }
};
