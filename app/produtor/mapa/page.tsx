"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

// ✅ Corrige ícone do marker no Next (senão some)
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

const LS_VIEW_KEY = "lfm_map_view_v1";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseCoords(input: string): LatLng | null {
  // aceita: "-15.6,-56.1" | "-15.6 -56.1" | "lat:-15.6 lng:-56.1"
  const cleaned = input
    .replace(/[a-zA-Z:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
      // Nominatim recomenda User-Agent / Referer; no browser não dá setar User-Agent
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
    const z = zoom ?? map.getZoom();
    map.flyTo([target.lat, target.lng], z, { duration: 0.8 });
  }, [target, zoom, map]);
  return null;
}

function PersistView() {
  const map = useMap();
  useMapEvents({
    moveend() {
      const c = map.getCenter();
      const z = map.getZoom();
      localStorage.setItem(
        LS_VIEW_KEY,
        JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z })
      );
    },
    zoomend() {
      const c = map.getCenter();
      const z = map.getZoom();
      localStorage.setItem(
        LS_VIEW_KEY,
        JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z })
      );
    },
  });
  return null;
}

export default function PageMapaProdutor() {
  const [base, setBase] = useState<"map" | "sat">("map");

  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [fly, setFly] = useState<LatLng | null>(null);

  const [searchText, setSearchText] = useState("");
  const [coordText, setCoordText] = useState("");

  const [busy, setBusy] = useState<null | "search" | "gps">(null);
  const [msg, setMsg] = useState<string>("");

  // view inicial (salva e restaura)
  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_VIEW_KEY);
      if (!raw) return { lat: -15.601, lng: -56.097, zoom: 12 }; // Cuiabá default
      const parsed = JSON.parse(raw);
      return {
        lat: clamp(Number(parsed.lat), -90, 90),
        lng: clamp(Number(parsed.lng), -180, 180),
        zoom: clamp(Number(parsed.zoom), 2, 19),
      };
    } catch {
      return { lat: -15.601, lng: -56.097, zoom: 12 };
    }
  }, []);

  // estilos “profissionais” sem depender do seu CSS atual
  const styles = useMemo(() => {
    const btn =
      "px-3 py-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md text-white/90 font-semibold shadow-[0_18px_50px_rgba(0,0,0,.35)] active:scale-[.98] transition";
    const panel =
      "rounded-2xl border border-white/15 bg-[#0a0e16]/65 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,.55)]";
    const input =
      "w-full px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white/90 outline-none focus:border-white/25";
    return { btn, panel, input };
  }, []);

  function goBack() {
    // volta para /produtor
    window.location.href = "/produtor";
  }

  async function onMyLocation() {
    setMsg("");
    setBusy("gps");

    if (!navigator.geolocation) {
      setBusy(null);
      setMsg("GPS não disponível neste aparelho/navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(target);
        setFly(target);
        setBusy(null);
      },
      (err) => {
        setBusy(null);
        if (err.code === err.PERMISSION_DENIED)
          setMsg("Permissão de localização negada.");
        else setMsg("Não consegui pegar seu local agora. Tente novamente.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  async function onSearchPlace() {
    const q = searchText.trim();
    if (!q) return;
    setMsg("");
    setBusy("search");
    try {
      const found = await nominatimSearch(q);
      if (!found) {
        setMsg("Não achei esse lugar. Tente: 'Campo Verde MT' ou 'Cuiabá'.");
      } else {
        setFly(found);
      }
    } catch {
      setMsg("Falha na busca. Sem internet ou bloqueio do serviço.");
    } finally {
      setBusy(null);
    }
  }

  function onGoCoords() {
    const parsed = parseCoords(coordText);
    if (!parsed) {
      setMsg("Coordenadas inválidas. Ex: -15.601,-56.097");
      return;
    }
    setMsg("");
    setFly(parsed);
  }

  const mapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  return (
    <div style={{ minHeight: "100vh", padding: 14 }}>
      {/* Topo */}
      <div
        className={styles.panel}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 12,
          borderRadius: 18,
          position: "sticky",
          top: 10,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.08)",
              display: "grid",
              placeItems: "center",
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Mapa</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              buscar • coordenadas • satélite • meu local
            </div>
          </div>
        </div>

        <button onClick={goBack} className={styles.btn} title="Voltar">
          Voltar
        </button>
      </div>

      {/* Painel de controles */}
      <div
        className={styles.panel}
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 20,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
          }}
        >
          {/* Base layer + Meu local */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className={styles.btn}
              onClick={() => setBase("map")}
              style={{
                background:
                  base === "map"
                    ? "linear-gradient(180deg, rgba(104,243,177,.22), rgba(104,243,177,.08))"
                    : undefined,
              }}
            >
              🗺️ Mapa
            </button>

            <button
              className={styles.btn}
              onClick={() => setBase("sat")}
              style={{
                background:
                  base === "sat"
                    ? "linear-gradient(180deg, rgba(104,243,177,.22), rgba(104,243,177,.08))"
                    : undefined,
              }}
            >
              🛰️ Satélite
            </button>

            <button className={styles.btn} onClick={onMyLocation}>
              📍 {busy === "gps" ? "Localizando..." : "Meu local"}
            </button>
          </div>

          {/* Busca */}
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Buscar cidade / fazenda / endereço
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className={styles.input}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Ex: Campo Verde MT, Cuiabá, Sorriso..."
              />
              <button
                className={styles.btn}
                onClick={onSearchPlace}
                disabled={busy === "search"}
                style={{ opacity: busy === "search" ? 0.7 : 1 }}
              >
                {busy === "search" ? "Buscando..." : "Ir"}
              </button>
            </div>
          </div>

          {/* Coordenadas */}
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Ir por coordenadas (lat,lng)
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className={styles.input}
                value={coordText}
                onChange={(e) => setCoordText(e.target.value)}
                placeholder="Ex: -15.601,-56.097"
              />
              <button className={styles.btn} onClick={onGoCoords}>
                Ir
              </button>
            </div>
          </div>

          {!!msg && (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "rgba(255,255,255,.88)",
                opacity: 0.95,
              }}
            >
              ⚠️ {msg}
            </div>
          )}
        </div>
      </div>

      {/* MAPA */}
      <div
        className={styles.panel}
        style={{
          marginTop: 12,
          borderRadius: 22,
          overflow: "hidden",
          height: "68vh",
          minHeight: 420,
        }}
      >
        <MapContainer
          center={[initial.lat, initial.lng]}
          zoom={initial.zoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
        >
          {base === "map" ? (
            <TileLayer
              url={mapUrl}
              attribution="&copy; OpenStreetMap"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              url={satUrl}
              attribution="&copy; Esri"
              maxZoom={19}
            />
          )}

          <PersistView />
          <FlyTo target={fly} />

          {myPos && (
            <Marker position={[myPos.lat, myPos.lng]}>
              <Popup>Você está aqui ✅</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        Dica: se o GPS travar, libera permissão do navegador e tenta de novo.
      </div>
    </div>
  );
}
