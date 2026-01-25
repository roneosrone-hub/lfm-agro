"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

// CSS do Leaflet e Draw (OBRIGATÓRIO)
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";

// Fix ícones (sem isso, marcador pode sumir no Next/Vercel)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src ?? markerIcon2x,
  iconUrl: (markerIcon as unknown as { src: string }).src ?? markerIcon,
  shadowUrl: (markerShadow as unknown as { src: string }).src ?? markerShadow,
});

// React-Leaflet (carrega só no client)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const LayersControl = dynamic(() => import("react-leaflet").then(m => m.LayersControl), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const ScaleControl = dynamic(() => import("react-leaflet").then(m => m.ScaleControl), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then(m => m.ZoomControl), { ssr: false });
const FeatureGroup = dynamic(() => import("react-leaflet").then(m => m.FeatureGroup), { ssr: false });

const EditControl = dynamic(
  () => import("react-leaflet-draw").then(m => m.EditControl),
  { ssr: false }
);

type LatLng = { lat: number; lng: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseLatLng(input: string): LatLng | null {
  // aceita: "-15.6,-56.1" ou "-15.6 -56.1"
  const cleaned = input.trim().replace(/\s+/g, " ");
  const parts = cleaned.includes(",") ? cleaned.split(",") : cleaned.split(" ");
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

async function nominatimSearch(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error("Falha na busca");
  return (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
}

export default function MapClient() {
  // Cuiabá como inicial
  const initialCenter = useMemo<LatLng>(() => ({ lat: -15.601, lng: -56.097 }), []);
  const [center, setCenter] = useState<LatLng>(initialCenter);

  const [gridHa, setGridHa] = useState<number>(10);
  const [qtdPontos, setQtdPontos] = useState<number>(30);

  const mapRef = useRef<L.Map | null>(null);

  // Meu local
  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [myAcc, setMyAcc] = useState<number | null>(null);

  // Busca cidade/endereço
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ name: string; pos: LatLng }>>([]);
  const [searching, setSearching] = useState(false);

  // Coordenadas
  const [coordText, setCoordText] = useState("");

  // Força o Leaflet recalcular tamanho (evita mapa cortado/deslocado)
  useEffect(() => {
    const t = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(t);
  }, []);

  function goTo(pos: LatLng, zoom = 14) {
    setCenter(pos);
    mapRef.current?.setView([pos.lat, pos.lng], zoom, { animate: true });
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    try {
      setSearching(true);
      const data = await nominatimSearch(q);
      const formatted = data.map(d => ({
        name: d.display_name,
        pos: { lat: Number(d.lat), lng: Number(d.lon) },
      }));
      setResults(formatted);
      if (formatted[0]) goTo(formatted[0].pos, 13);
    } catch {
      setResults([]);
      alert("Não consegui buscar. Tente outro nome (ex.: 'Campo Verde MT').");
    } finally {
      setSearching(false);
    }
  }

  function handleGoCoords() {
    const parsed = parseLatLng(coordText);
    if (!parsed) {
      alert("Formato inválido. Use: -15.601,-56.097");
      return;
    }
    goTo(parsed, 15);
  }

  function handleMyLocation() {
    if (!("geolocation" in navigator)) {
      alert("Seu navegador não suporta geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(p);
        setMyAcc(pos.coords.accuracy);
        goTo(p, 16);
      },
      (err) => {
        alert("Não consegui pegar sua localização. Ative o GPS e permita o acesso ao local.");
        console.log(err);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  // Leaflet Draw: pega o polígono desenhado (talhão)
  function onCreated(e: any) {
    // Aqui você pode salvar o geojson se quiser
    // const layer = e.layer;
    // const geo = layer.toGeoJSON();
  }

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, margin: "6px 0 6px", fontWeight: 900 }}>Mapa de Monitoramento</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        1) Desenhe o talhão (polígono). 2) Defina o tamanho do grid (ha) e quantos pontos. 3) Clique em “Gerar pontos”.
      </p>

      {/* Controles superiores */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 14,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Grid (ha)</div>
          <input
            value={gridHa}
            onChange={(e) => setGridHa(clamp(Number(e.target.value || 0), 1, 500))}
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Qtde pontos</div>
          <input
            value={qtdPontos}
            onChange={(e) => setQtdPontos(clamp(Number(e.target.value || 0), 1, 5000))}
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        {/* Busca */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Pesquisar cidade / local</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex.: Campo Verde MT, Jaciara, Nova Ubiratã..."
              style={inputStyle}
            />
            <button onClick={handleSearch} style={btnPrimary}>
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {!!results.length && (
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              {results.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(r.pos, 13)}
                  style={btnGhost}
                  title={r.name}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coordenadas */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Ir para coordenadas (lat,lng)</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={coordText}
              onChange={(e) => setCoordText(e.target.value)}
              placeholder="Ex.: -15.601,-56.097"
              style={inputStyle}
            />
            <button onClick={handleGoCoords} style={btnPrimary}>
              Ir
            </button>
            <button onClick={handleMyLocation} style={btnGhost}>
              📍 Meu local
            </button>
          </div>
        </div>

        {/* Botões principais do seu fluxo */}
        <div style={{ display: "flex", gap: 10, gridColumn: "1 / -1" }}>
          <button
            onClick={() => alert("Aqui entra sua lógica de gerar pontos (grid + qtd).")}
            style={btnPrimary}
          >
            Gerar pontos
          </button>
          <a href="/produtor" style={{ ...btnGhost, textAlign: "center", lineHeight: "44px" }}>
            Voltar
          </a>
        </div>
      </div>

      {/* MAPA */}
      <div style={mapWrap}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map;
            // evita bug de tiles cortados
            setTimeout(() => map.invalidateSize(), 250);
          }}
          zoomControl={false}
        >
          <ZoomControl position="topleft" />
          <ScaleControl position="bottomleft" />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Mapa (OpenStreetMap)">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satélite (ESRI)">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Topo (OpenTopoMap)">
              <TileLayer
                attribution="&copy; OpenTopoMap"
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Draw do talhão */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                  shapeOptions: { weight: 3 },
                },
              }}
              edit={{ edit: true, remove: true }}
            />
          </FeatureGroup>

          {/* Minha localização */}
          {myPos && (
            <>
              <Marker position={[myPos.lat, myPos.lng]}>
                <Popup>Você está aqui</Popup>
              </Marker>
              {myAcc && <Circle center={[myPos.lat, myPos.lng]} radius={myAcc} pathOptions={{ weight: 1 }} />}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

/* estilos simples e estáveis (sem depender do seu CSS global) */
const inputStyle: React.CSSProperties = {
  height: 44,
  width: "100%",
  padding: "0 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.06)",
  color: "rgba(255,255,255,.92)",
  outline: "none",
  fontWeight: 700,
};

const btnPrimary: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(170,255,205,.22)",
  background: "rgba(50,150,100,.26)",
  color: "rgba(255,255,255,.92)",
  fontWeight: 900,
  cursor: "pointer",
  minWidth: 120,
};

const btnGhost: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.05)",
  color: "rgba(255,255,255,.92)",
  fontWeight: 900,
  cursor: "pointer",
};

const mapWrap: React.CSSProperties = {
  height: "62vh",
  minHeight: 420,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.04)",
};
