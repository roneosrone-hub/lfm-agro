"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapaProdutorClient = dynamic(() => Promise.resolve(MapaProdutorInner), {
  ssr: false,
});

export default function Page() {
  return <MapaProdutorClient />;
}

/* -------------------- CLIENT (sem SSR) -------------------- */

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
    useMap,
  } = require("react-leaflet") as typeof import("react-leaflet");

  const { FeatureGroup } = require("react-leaflet") as typeof import("react-leaflet");
  const { EditControl } = require("react-leaflet-draw") as any;

  const L = require("leaflet") as typeof import("leaflet");

  // Corrige ícones do Leaflet (senão some no Vercel)
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
  }, [L]);

  type LatLng = [number, number]; // [lat, lng]
  type Ponto = { id: string; lat: number; lng: number; n: number };

  const center = useMemo<LatLng>(() => [-15.60, -56.10], []);

  const fgRef = useRef<any>(null);

  const [polyLatLngs, setPolyLatLngs] = useState<LatLng[] | null>(null);
  const [areaHa, setAreaHa] = useState<number>(0);

  const [gridHa, setGridHa] = useState<number>(10);
  const [qtdPontos, setQtdPontos] = useState<number>(30);

  const [gridPolys, setGridPolys] = useState<LatLng[][]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [msg, setMsg] = useState<string>("Desenhe a área (talhão) no mapa.");

  function uid() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function toGeoJSONPolygon(latlngs: LatLng[]) {
    // turf usa [lng,lat]
    const coords = latlngs.map(([lat, lng]) => [lng, lat]);
    // fecha o polígono
    if (coords.length > 0) coords.push(coords[0]);
    return turf.polygon([coords]);
  }

  function calcAreaHa(latlngs: LatLng[]) {
    const poly = toGeoJSONPolygon(latlngs);
    const m2 = turf.area(poly);
    return m2 / 10000;
  }

  function onCreated(e: any) {
    try {
      const layer = e.layer;
      const gj = layer.toGeoJSON();
      // gj.geometry.coordinates[0] => [[lng,lat], ...]
      const ring = gj.geometry.coordinates[0] as [number, number][];
      // remove o último (fechamento duplicado)
      const cleaned = ring.slice(0, ring.length - 1).map(([lng, lat]) => [lat, lng] as LatLng);

      setPolyLatLngs(cleaned);

      const ha = calcAreaHa(cleaned);
      setAreaHa(ha);

      setGridPolys([]);
      setPontos([]);

      setMsg(`Área capturada: ${ha.toFixed(2)} ha. Agora gere grid ou pontos.`);
    } catch (err) {
      console.error(err);
      setMsg("Erro ao capturar área. Tente desenhar de novo.");
    }
  }

  function onDeleted() {
    setPolyLatLngs(null);
    setAreaHa(0);
    setGridPolys([]);
    setPontos([]);
    setMsg("Área removida. Desenhe novamente.");
  }

  function limparTudo() {
    try {
      // limpa layers desenhados
      if (fgRef.current) {
        fgRef.current.clearLayers();
      }
    } catch {}
    setPolyLatLngs(null);
    setAreaHa(0);
    setGridPolys([]);
    setPontos([]);
    setMsg("Tudo limpo. Desenhe a área (talhão) novamente.");
  }

  function gerarGrid() {
    if (!polyLatLngs || polyLatLngs.length < 3) {
      setMsg("Primeiro desenhe a área do talhão.");
      return;
    }

    const ha = Math.max(0.1, Number(gridHa) || 10);

    const poly = toGeoJSONPolygon(polyLatLngs);
    const bbox = turf.bbox(poly);

    // transforma hectares em tamanho de célula (lado) em km:
    // 1 ha = 10.000 m² ; lado(m) = sqrt(ha*10.000)
    const ladoKm = Math.sqrt(ha * 10000) / 1000;

    // squareGrid cria quadrados cobrindo bbox
    const grid = turf.squareGrid(bbox, ladoKm, { units: "kilometers" });

    // filtra apenas quadrados que intersectam o talhão
    const inside = grid.features.filter((f: any) => {
      try {
        return turf.booleanIntersects(f, poly);
      } catch {
        return false;
      }
    });

    // converte para latlngs para desenhar no Leaflet
    const latlngPolys: LatLng[][] = inside.map((f: any) => {
      const ring = f.geometry.coordinates[0] as [number, number][];
      // ring vem fechado; removemos o último
      return ring.slice(0, ring.length - 1).map(([lng, lat]) => [lat, lng] as LatLng);
    });

    setGridPolys(latlngPolys);

    // gera 1 ponto por célula (centroide) e NUMERA
    const pts: Ponto[] = inside
      .map((f: any, idx: number) => {
        const c = turf.centerOfMass(f);
        const [lng, lat] = c.geometry.coordinates as [number, number];
        return { id: uid(), lat, lng, n: idx + 1 };
      })
      // garante que o ponto cai dentro do polígono (alguns centroides podem cair fora)
      .filter((p: Ponto) => {
        try {
          return turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poly);
        } catch {
          return true;
        }
      })
      .map((p: Ponto, i: number) => ({ ...p, n: i + 1 }));

    setPontos(pts);

    setMsg(
      `Grid gerado (~${ha} ha por célula). Pontos: ${pts.length} (1 por célula).`
    );
  }

  function gerarPontosPorQuantidade() {
    if (!polyLatLngs || polyLatLngs.length < 3) {
      setMsg("Primeiro desenhe a área do talhão.");
      return;
    }

    const N = Math.max(1, Math.min(500, Number(qtdPontos) || 30));
    const poly = toGeoJSONPolygon(polyLatLngs);
    const bbox = turf.bbox(poly);

    const pts: Ponto[] = [];
    let tentativas = 0;

    // gera aleatórios dentro do bbox e aceita só os que caem dentro do talhão
    while (pts.length < N && tentativas < N * 200) {
      tentativas++;
      const rp = turf.randomPoint(1, { bbox }).features[0];
      const [lng, lat] = rp.geometry.coordinates as [number, number];

      try {
        const ok = turf.booleanPointInPolygon(turf.point([lng, lat]), poly);
        if (ok) {
          pts.push({ id: uid(), lat, lng, n: pts.length + 1 });
        }
      } catch {
        // em caso de erro, aceita para não travar
        pts.push({ id: uid(), lat, lng, n: pts.length + 1 });
      }
    }

    setGridPolys([]);
    setPontos(pts);
    setMsg(`Gerados ${pts.length} pontos amostrais (quantidade escolhida: ${N}).`);
  }

  function exportarGeoJSON() {
    if (!polyLatLngs) {
      setMsg("Nada para exportar. Desenhe a área primeiro.");
      return;
    }

    const turfPoly = toGeoJSONPolygon(polyLatLngs);

    const featGrid = gridPolys.map((latlngs) => {
      const poly = toGeoJSONPolygon(latlngs);
      return turf.feature(poly.geometry, { tipo: "grid" });
    });

    const featPts = pontos.map((p) =>
      turf.point([p.lng, p.lat], { tipo: "ponto", n: p.n })
    );

    const fc = turf.featureCollection([
      turf.feature(turfPoly.geometry, { tipo: "talhao", area_ha: Number(areaHa.toFixed(4)) }),
      ...featGrid,
      ...featPts,
    ]);

    const blob = new Blob([JSON.stringify(fc, null, 2)], {
      type: "application/geo+json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lfm_amostragem.geojson";
    a.click();
    URL.revokeObjectURL(url);

    setMsg("Exportado: lfm_amostragem.geojson");
  }

  function FitToPoly() {
    const map = useMap();
    useEffect(() => {
      if (!polyLatLngs || polyLatLngs.length < 3) return;
      try {
        const bounds = (require("leaflet") as typeof import("leaflet")).latLngBounds(polyLatLngs as any);
        map.fitBounds(bounds.pad(0.2));
      } catch {}
    }, [map, polyLatLngs]);
    return null;
  }

  const styles: any = {
    page: {
      minHeight: "100vh",
      background: "radial-gradient(1200px 800px at 20% 10%, rgba(80,120,60,.35), rgba(7,11,18,1) 55%)",
      padding: 14,
      color: "white",
    },
    card: {
      maxWidth: 980,
      margin: "0 auto",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(10,14,22,.55)",
      boxShadow: "0 20px 60px rgba(0,0,0,.55)",
      overflow: "hidden",
    },
    top: {
      padding: 14,
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,.08)",
    },
    title: { fontSize: 18, fontWeight: 900, letterSpacing: 0.2 },
    sub: { opacity: 0.8, fontSize: 12, marginTop: 2 },
    row: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    pill: {
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.06)",
      fontSize: 12,
      opacity: 0.95,
    },
    input: {
      width: 86,
      padding: "10px 10px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "white",
      outline: "none",
    },
    btn: {
      padding: "11px 12px",
      borderRadius: 14,
      border: "1px solid rgba(140,190,90,.45)",
      background: "rgba(120,170,70,.22)",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },
    btn2: {
      padding: "11px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },
    danger: {
      padding: "11px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,90,90,.35)",
      background: "rgba(255,90,90,.12)",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },
    mapWrap: { height: "74vh", minHeight: 520 },
    footer: {
      padding: 12,
      borderTop: "1px solid rgba(255,255,255,.08)",
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    msg: { fontSize: 12, opacity: 0.85 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.top}>
          <div>
            <div style={styles.title}>Mapa • Amostragem (Produtor)</div>
            <div style={styles.sub}>
              Desenhe o talhão → gere grade (5/10 ha) ou gere N pontos.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <div style={styles.pill}>Área: <b>{areaHa ? areaHa.toFixed(2) : "0.00"}</b> ha</div>
              <div style={styles.pill}>Grid: <b>{gridPolys.length}</b> células</div>
              <div style={styles.pill}>Pontos: <b>{pontos.length}</b></div>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.pill}>
              Grid (ha):
              <input
                style={styles.input}
                value={gridHa}
                onChange={(e: any) => setGridHa(Number(e.target.value))}
                inputMode="decimal"
              />
            </div>

            <button style={styles.btn} onClick={gerarGrid}>
              Gerar grade + pontos
            </button>

            <div style={styles.pill}>
              Pontos (N):
              <input
                style={styles.input}
                value={qtdPontos}
                onChange={(e: any) => setQtdPontos(Number(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <button style={styles.btn2} onClick={gerarPontosPorQuantidade}>
              Gerar pontos (N)
            </button>

            <button style={styles.btn2} onClick={exportarGeoJSON}>
              Exportar GeoJSON
            </button>

            <button style={styles.danger} onClick={limparTudo}>
              Limpar
            </button>
          </div>
        </div>

        <div style={styles.mapWrap}>
          <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
            <FitToPoly />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FeatureGroup ref={fgRef}>
              <EditControl
                position="topleft"
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
                    metric: true,
                  },
                }}
                edit={{
                  edit: false,
                }}
              />
            </FeatureGroup>

            {polyLatLngs && <Polygon positions={polyLatLngs as any} pathOptions={{ weight: 3 }} />}

            {gridPolys.map((g, i) => (
              <Polygon
                key={"g-" + i}
                positions={g as any}
                pathOptions={{ weight: 1, opacity: 0.6, fillOpacity: 0.05 }}
              />
            ))}

            {pontos.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng] as any}>
                <Popup>
                  <b>Ponto {p.n}</b>
                  <br />
                  Lat: {p.lat.toFixed(6)}
                  <br />
                  Lng: {p.lng.toFixed(6)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={styles.footer}>
          <div style={styles.msg}>{msg}</div>
          <a href="/produtor" style={{ ...styles.btn2, textDecoration: "none" }}>
            ← Voltar
          </a>
        </div>
      </div>
    </div>
  );
}
