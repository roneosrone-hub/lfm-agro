"use client";

import dynamic from "next/dynamic";

const MapaClient = dynamic(() => Promise.resolve(MapaInner), { ssr: false });
export default function Page() {
  return <MapaClient />;
}

type StatusPonto = "OK" | "ALERTA" | "CRITICO";

type PontoGrid = {
  id: string;
  lat: number;
  lng: number;
  status: StatusPonto;
  obs?: string;
};

type TalhaoState = {
  polygonLatLngs: Array<{ lat: number; lng: number }>;
  pontos: PontoGrid[];
  qtdGrid: number;
};

const LS_KEY = "lfm_agro_talhao_grid_v1";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function MapaInner() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  const { useEffect, useMemo, useRef, useState } = React;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require("leaflet");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("leaflet-draw"); // importante
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const turf = require("@turf/turf");

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    CircleMarker,
    useMap,
  } = require("react-leaflet");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { FeatureGroup } = require("react-leaflet");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { EditControl } = require("react-leaflet-draw");

  const center = useMemo(() => [-15.60, -56.10] as [number, number], []);

  const [modoSat, setModoSat] = useState(false);
  const [meuLocal, setMeuLocal] = useState<[number, number] | null>(null);

  const [qtdGrid, setQtdGrid] = useState(30);
  const [polygonLatLngs, setPolygonLatLngs] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [pontos, setPontos] = useState<PontoGrid[]>([]);

  const featureGroupRef = useRef<any>(null);

  // Corrige ícone padrão do Leaflet no Next/Vercel
  useEffect(() => {
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
  }, [L]);

  // Carrega estado salvo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as TalhaoState;
      if (data?.polygonLatLngs?.length) setPolygonLatLngs(data.polygonLatLngs);
      if (data?.pontos?.length) setPontos(data.pontos);
      if (typeof data?.qtdGrid === "number") setQtdGrid(data.qtdGrid);
    } catch {}
  }, []);

  function salvar() {
    const payload: TalhaoState = { polygonLatLngs, pontos, qtdGrid };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    alert("Salvo ✅");
  }

  function limparTudo() {
    setPolygonLatLngs([]);
    setPontos([]);
    localStorage.removeItem(LS_KEY);

    // limpa no mapa (camada de desenho)
    const fg = featureGroupRef.current;
    if (fg && fg._leaflet_id) {
      try {
        fg.clearLayers();
      } catch {}
    }
    alert("Limpo ✅");
  }

  function statusTalhao(): StatusPonto | null {
    if (!pontos.length) return null;
    if (pontos.some((p) => p.status === "CRITICO")) return "CRITICO";
    if (pontos.some((p) => p.status === "ALERTA")) return "ALERTA";
    return "OK";
  }

  function corTalhao(): { color: string; fillColor: string; fillOpacity: number } {
    const st = statusTalhao();
    if (st === "CRITICO") return { color: "#b00020", fillColor: "#ff1744", fillOpacity: 0.28 };
    if (st === "ALERTA") return { color: "#b26a00", fillColor: "#ffb300", fillOpacity: 0.22 };
    if (st === "OK") return { color: "#0b6b2a", fillColor: "#00c853", fillOpacity: 0.18 };
    return { color: "#00c853", fillColor: "#00c853", fillOpacity: 0.0 };
  }

  function corPonto(status: StatusPonto) {
    if (status === "CRITICO") return "#ff1744";
    if (status === "ALERTA") return "#ffb300";
    return "#00c853";
  }

  function gerarGridDentroDoPoligono() {
    if (polygonLatLngs.length < 3) {
      alert("Desenhe um talhão (polígono) primeiro.");
      return;
    }

    // turf precisa [lng,lat]
    const coords = polygonLatLngs.map((p) => [p.lng, p.lat]);
    // fecha o polígono
    coords.push([polygonLatLngs[0].lng, polygonLatLngs[0].lat]);

    const poly = turf.polygon([coords]);

    // calcula bbox e tenta gerar pontos aleatórios até atingir qtd
    const bbox = turf.bbox(poly);
    const gerados: PontoGrid[] = [];
    let tentativas = 0;

    while (gerados.length < qtdGrid && tentativas < qtdGrid * 500) {
      tentativas++;
      const pt = turf.randomPoint(1, { bbox }).features[0];
      const inside = turf.booleanPointInPolygon(pt, poly);
      if (!inside) continue;

      const [lng, lat] = pt.geometry.coordinates;
      gerados.push({
        id: uid(),
        lat,
        lng,
        status: "OK",
      });
    }

    if (!gerados.length) {
      alert("Não consegui gerar pontos. Tente aumentar a área do talhão.");
      return;
    }

    setPontos(gerados);
    alert(`Grides gerados: ${gerados.length} ✅`);
  }

  function atualizarStatusPonto(id: string, status: StatusPonto) {
    setPontos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  function onCreated(e: any) {
    const layer = e.layer;

    // Só aceita POLÍGONO
    if (!layer?.getLatLngs) return;

    const latlngs = layer.getLatLngs()?.[0] || [];
    const simples = latlngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));

    if (simples.length < 3) {
      alert("Polígono inválido.");
      return;
    }

    setPolygonLatLngs(simples);
    setPontos([]); // ao redesenhar talhão, zera os grides
  }

  function onDeleted() {
    setPolygonLatLngs([]);
    setPontos([]);
  }

  function BtnMeuLocal() {
    const map = useMap();
    const pegarLocal = () => {
      if (!navigator.geolocation) {
        alert("GPS não disponível.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos: any) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMeuLocal([lat, lng]);
          map.setView([lat, lng], 16);
        },
        () => alert("Não consegui pegar o GPS. Verifique permissão."),
        { enableHighAccuracy: true, timeout: 12000 }
      );
    };

    return (
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 9999 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <button
            onClick={() => setModoSat(false)}
            style={btnStyle()}
            type="button"
          >
            🗺️ Mapa
          </button>
          <button
            onClick={() => setModoSat(true)}
            style={btnStyle()}
            type="button"
          >
            🛰️ Satélite
          </button>
          <button onClick={pegarLocal} style={btnStyle()} type="button">
            📍 Meu local
          </button>

          <div style={panelStyle()}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Talhão / Grides
            </div>

            <label style={labelStyle()}>
              Qtd. de grides
              <input
                value={qtdGrid}
                onChange={(ev: any) => setQtdGrid(Number(ev.target.value || 0))}
                type="number"
                min={5}
                max={300}
                style={inputStyle()}
              />
            </label>

            <button onClick={gerarGridDentroDoPoligono} style={btnStyle()} type="button">
              🔳 Gerar grides
            </button>

            <button onClick={salvar} style={btnStyle()} type="button">
              💾 Salvar
            </button>

            <button onClick={limparTudo} style={btnDanger()} type="button">
              🧹 Limpar
            </button>

            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
              1) Desenhe o talhão (ícone de polígono) <br />
              2) Clique em “Gerar grides” <br />
              3) Toque em cada ponto e marque status
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tile = modoSat
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attr = modoSat
    ? "Tiles © Esri"
    : "© OpenStreetMap contributors";

  const estiloTalhao = corTalhao();

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url={tile} attribution={attr} />

        <BtnMeuLocal />

        {meuLocal && (
          <Marker position={meuLocal}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}

        {/* Talhão colorido conforme monitoramento */}
        {polygonLatLngs.length >= 3 && (
          <Polygon
            positions={polygonLatLngs.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: estiloTalhao.color,
              fillColor: estiloTalhao.fillColor,
              fillOpacity: estiloTalhao.fillOpacity,
              weight: 3,
            }}
          />
        )}

        {/* Ferramenta de desenho */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              polygon: true,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
            edit={{
              edit: false,
              remove: true,
            }}
          />
        </FeatureGroup>

        {/* Pontos do grid */}
        {pontos.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={8}
            pathOptions={{
              color: corPonto(p.status),
              fillColor: corPonto(p.status),
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  Ponto de amostragem
                </div>

                <div style={{ marginBottom: 8 }}>
                  Status atual: <b>{p.status}</b>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    style={btnOk()}
                    onClick={() => atualizarStatusPonto(p.id, "OK")}
                    type="button"
                  >
                    ✅ Verde (OK)
                  </button>
                  <button
                    style={btnWarn()}
                    onClick={() => atualizarStatusPonto(p.id, "ALERTA")}
                    type="button"
                  >
                    ⚠️ Amarelo (Alerta)
                  </button>
                  <button
                    style={btnCrit()}
                    onClick={() => atualizarStatusPonto(p.id, "CRITICO")}
                    type="button"
                  >
                    🛑 Vermelho (Crítico)
                  </button>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                  Depois de marcar vários pontos, o talhão muda de cor.
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

/* =========================
   estilos simples inline
========================= */

function btnStyle() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(20,20,30,0.72)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties;
}

function btnDanger() {
  return {
    ...btnStyle(),
    background: "rgba(160,0,0,0.7)",
  } as React.CSSProperties;
}

function panelStyle() {
  return {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,10,18,0.72)",
    color: "white",
    width: 220,
  } as React.CSSProperties;
}

function labelStyle() {
  return {
    display: "grid",
    gap: 6,
    fontSize: 12,
    marginBottom: 10,
  } as React.CSSProperties;
}

function inputStyle() {
  return {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  } as React.CSSProperties;
}

function btnOk() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,200,83,0.55)",
    background: "rgba(0,200,83,0.2)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties;
}

function btnWarn() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,179,0,0.55)",
    background: "rgba(255,179,0,0.18)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties;
}

function btnCrit() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,23,68,0.55)",
    background: "rgba(255,23,68,0.18)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties;
}
