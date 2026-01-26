"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

/* Corrige marker no Next */
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LatLng = { lat: number; lng: number };
const LS_VIEW_KEY = "lfm_map_view_v3";

function parseCoords(input: string): LatLng | null {
  const cleaned = input.replace(/[a-zA-Z:]/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/[ ,]+/).filter(Boolean);
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

async function nominatimSearch(q: string): Promise<LatLng | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(q);

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as any[];
  if (!data?.length) return null;
  const lat = Number(data[0].lat);
  const lng = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function FlyTo({ target, zoom }: { target: LatLng | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], zoom ?? map.getZoom(), { duration: 0.85 });
  }, [target, zoom, map]);
  return null;
}

function SaveView() {
  const map = useMap();
  useEffect(() => {
    const save = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      localStorage.setItem(LS_VIEW_KEY, JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z }));
    };
    map.on("moveend", save);
    map.on("zoomend", save);
    return () => {
      map.off("moveend", save);
      map.off("zoomend", save);
    };
  }, [map]);
  return null;
}

/** TileLayer com fallback: se satélite falhar, volta pro mapa e mostra aviso */
function SmartTiles({
  base,
  onSatFail,
}: {
  base: "map" | "sat";
  onSatFail: (msg: string) => void;
}) {
  const [key, setKey] = useState(0);

  // OSM (estável)
  const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // SAT (Esri pode bloquear; por isso tem fallback)
  const ESRI =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // Detecta tile error e faz fallback
  const tileRef = useRef<any>(null);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [base]);

  if (base === "map") {
    return <TileLayer key={key} url={OSM} attribution="&copy; OpenStreetMap" maxZoom={19} />;
  }

  return (
    <TileLayer
      key={key}
      url={ESRI}
      attribution="&copy; Esri"
      maxZoom={19}
      ref={tileRef}
      eventHandlers={{
        tileerror: () => {
          onSatFail("Satélite bloqueado/indisponível. Voltei pro mapa (OSM).");
        },
      }}
    />
  );
}

export default function MapaProdutor() {
  const [base, setBase] = useState<"map" | "sat">("map");
  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [fly, setFly] = useState<LatLng | null>(null);

  const [placeText, setPlaceText] = useState("Campo Verde - MT");
  const [coordText, setCoordText] = useState("");
  const [busy, setBusy] = useState<null | "gps" | "search">(null);
  const [msg, setMsg] = useState("");

  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_VIEW_KEY);
      if (!raw) return { lat: -15.601, lng: -56.097, zoom: 12 };
      const p = JSON.parse(raw);
      return {
        lat: Number(p.lat) || -15.601,
        lng: Number(p.lng) || -56.097,
        zoom: Number(p.zoom) || 12,
      };
    } catch {
      return { lat: -15.601, lng: -56.097, zoom: 12 };
    }
  }, []);

  const panel: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(10, 14, 22, .62)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 22px 70px rgba(0,0,0,.55)",
  };

  const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.92)",
    fontWeight: 800,
  };

  const btnOn: React.CSSProperties = {
    ...btn,
    background: "linear-gradient(180deg, rgba(104,243,177,.22), rgba(104,243,177,.08))",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    color: "rgba(255,255,255,.92)",
    outline: "none",
  };

  async function onMyLocation() {
    setMsg("");
    setBusy("gps");

    if (!navigator.geolocation) {
      setBusy(null);
      setMsg("GPS não disponível.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const t = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(t);
        setFly(t);
        setBusy(null);
      },
      () => {
        setBusy(null);
        setMsg("Sem permissão de localização ou GPS indisponível.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  async function onSearchPlace() {
    const q = placeText.trim();
    if (!q) return;

    setMsg("");
    setBusy("search");
    try {
      const found = await nominatimSearch(q);
      if (!found) setMsg("Não encontrei. Tente: 'Campo Verde MT'.");
      else setFly(found);
    } catch {
      setMsg("Falha na busca (sem internet/bloqueio).");
    } finally {
      setBusy(null);
    }
  }

  function onGoCoords() {
    const p = parseCoords(coordText);
    if (!p) {
      setMsg("Coordenadas inválidas. Ex: -15.601,-56.097");
      return;
    }
    setMsg("");
    setFly(p);
  }

  function onSatFail(m: string) {
    setMsg(m);
    setBase("map");
  }

  return (
    <div style={{ minHeight: "100vh", padding: 14 }}>
      <div
        style={{
          ...panel,
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "sticky",
          top: 10,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.14)",
              background: "rgba(255,255,255,.08)",
              display: "grid",
              placeItems: "center",
            }}
          >
            🗺️
          </div>
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1, fontSize: 16 }}>
              Mapa de Monitoramento
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              mapa • satélite • meu local • busca • coordenadas
            </div>
          </div>
        </div>

        <button style={btn} onClick={() => (window.location.href = "/produtor")}>
          Voltar
        </button>
      </div>

      <div style={{ ...panel, marginTop: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={base === "map" ? btnOn : btn} onClick={() => setBase("map")}>
            🗺️ Mapa
          </button>
          <button style={base === "sat" ? btnOn : btn} onClick={() => setBase("sat")}>
            🛰️ Satélite
          </button>
          <button style={btn} onClick={onMyLocation}>
            📍 {busy === "gps" ? "Localizando..." : "Meu local"}
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.78 }}>Pesquisar cidade/endereço</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={input}
              value={placeText}
              onChange={(e) => setPlaceText(e.target.value)}
              placeholder="Ex: Campo Verde - MT"
            />
            <button style={btn} onClick={onSearchPlace} disabled={busy === "search"}>
              {busy === "search" ? "Buscando..." : "Ir"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.78 }}>Ir por coordenadas (lat,lng)</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={input}
              value={coordText}
              onChange={(e) => setCoordText(e.target.value)}
              placeholder="Ex: -15.601,-56.097"
            />
            <button style={btn} onClick={onGoCoords}>
              Ir
            </button>
          </div>
        </div>

        {!!msg && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.92 }}>
            ⚠️ {msg}
          </div>
        )}
      </div>

      <div
        style={{
          ...panel,
          marginTop: 12,
          height: "70vh",
          minHeight: 440,
          overflow: "hidden",
          borderRadius: 22,
        }}
      >
        <MapContainer
          center={[initial.lat, initial.lng]}
          zoom={initial.zoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
        >
          <SmartTiles base={base} onSatFail={onSatFail} />
          <SaveView />
          <FlyTo target={fly} zoom={16} />

          {myPos && (
            <Marker position={[myPos.lat, myPos.lng]}>
              <Popup>Você está aqui ✅</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
