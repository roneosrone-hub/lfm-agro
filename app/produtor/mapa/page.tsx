"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";

// ✅ Corrige ícones padrão do Leaflet no Next (senão some o marker)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type Place = {
  display_name: string;
  lat: string;
  lon: string;
};

function FlyTo({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function MapaProdutorPage() {
  const [base, setBase] = useState<"mapa" | "satelite" | "hibrido">("mapa");
  const [myPos, setMyPos] = useState<[number, number] | null>(null);
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);

  const [q, setQ] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [coordText, setCoordText] = useState("");

  const mapDefaultCenter: [number, number] = useMemo(() => [-15.601, -56.097], []); // MT (ajuste se quiser)
  const defaultZoom = 12;

  const searchAbort = useRef<AbortController | null>(null);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    // configura ícone padrão
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: (marker2x as unknown as { src: string }).src ?? (marker2x as unknown as string),
      iconUrl: (marker1x as unknown as { src: string }).src ?? (marker1x as unknown as string),
      shadowUrl: (markerShadow as unknown as { src: string }).src ?? (markerShadow as unknown as string),
    });
  }, []);

  // ✅ Busca (Nominatim) com debounce
  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setResults([]);
      return;
    }

    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      try {
        setLoadingSearch(true);
        if (searchAbort.current) searchAbort.current.abort();
        searchAbort.current = new AbortController();

        const url =
          "https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=" +
          encodeURIComponent(term);

        const res = await fetch(url, {
          signal: searchAbort.current.signal,
          headers: {
            // Nominatim recomenda um identificador (ajuda a não bloquear)
            "Accept": "application/json",
          },
        });

        const data = (await res.json()) as Place[];
        setResults(data || []);
      } catch (e) {
        // ignora abort
      } finally {
        setLoadingSearch(false);
      }
    }, 450);

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [q]);

  function parseCoords(text: string): [number, number] | null {
    // aceita: "-15.60, -56.09" ou "-15.60 -56.09"
    const clean = text.replace(/[;]/g, ",").trim();
    const parts = clean.includes(",") ? clean.split(",") : clean.split(/\s+/);
    if (parts.length < 2) return null;
    const lat = Number(parts[0].trim());
    const lon = Number(parts[1].trim());
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return [lat, lon];
  }

  async function goMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste aparelho/navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMyPos(c);
        setFlyCenter(c);
      },
      (err) => {
        alert("Não consegui pegar sua localização. Ative o GPS/permissão do navegador.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  }

  function goToCoords() {
    const c = parseCoords(coordText);
    if (!c) {
      alert("Coordenadas inválidas. Ex: -15.601, -56.097");
      return;
    }
    setFlyCenter(c);
  }

  const tiles = {
    // ✅ MAPA (OSM)
    mapa: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; OpenStreetMap',
    },
    // ✅ SATÉLITE (ESRI)
    satelite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
    },
    // ✅ HÍBRIDO = satélite + labels por cima
    labels: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; OpenStreetMap',
    },
  };

  return (
    <div style={styles.page}>
      {/* ✅ CSS anti-briga do Leaflet (sem mexer no seu globals.css) */}
      <style>{`
        .leaflet-container { width: 100%; height: 100%; background: #0b1220; }
        .leaflet-container img { max-width: none !important; }
        .leaflet-control-attribution { font-size: 11px; opacity: .75; }
      `}</style>

      <div style={styles.top}>
        <div>
          <div style={styles.title}>Mapa de Monitoramento</div>
          <div style={styles.sub}>
            Pesquise cidade/local, use coordenadas ou vá no seu local. Troque entre Mapa/Satélite.
          </div>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.row}>
          <div style={styles.segment}>
            <button
              style={{ ...styles.segBtn, ...(base === "mapa" ? styles.segActive : {}) }}
              onClick={() => setBase("mapa")}
            >
              🗺️ Mapa
            </button>
            <button
              style={{ ...styles.segBtn, ...(base === "satelite" ? styles.segActive : {}) }}
              onClick={() => setBase("satelite")}
            >
              🛰️ Satélite
            </button>
            <button
              style={{ ...styles.segBtn, ...(base === "hibrido" ? styles.segActive : {}) }}
              onClick={() => setBase("hibrido")}
            >
              🧩 Híbrido
            </button>
          </div>

          <button style={styles.primaryBtn} onClick={goMyLocation}>
            📍 Meu local
          </button>
        </div>

        <div style={styles.row2}>
          <div style={styles.col}>
            <label style={styles.lbl}>Buscar cidade/local</label>
            <div style={styles.inputWrap}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex: Campo Verde, MT / Jaciara / Nova Ubiratã..."
                style={styles.input}
              />
              <div style={styles.mini}>
                {loadingSearch ? "Buscando..." : results.length ? `${results.length} resultados` : "Digite 3+ letras"}
              </div>
            </div>

            {results.length > 0 && (
              <div style={styles.dropdown}>
                {results.map((r, idx) => (
                  <button
                    key={idx}
                    style={styles.ddItem}
                    onClick={() => {
                      const c: [number, number] = [Number(r.lat), Number(r.lon)];
                      setFlyCenter(c);
                      setResults([]);
                    }}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={styles.col}>
            <label style={styles.lbl}>Ir por coordenadas</label>
            <div style={styles.coordRow}>
              <input
                value={coordText}
                onChange={(e) => setCoordText(e.target.value)}
                placeholder="Ex: -15.601, -56.097"
                style={styles.input}
                inputMode="decimal"
              />
              <button style={styles.ghostBtn} onClick={goToCoords}>
                Ir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mapWrap}>
        <MapContainer
          center={myPos ?? mapDefaultCenter}
          zoom={defaultZoom}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
          preferCanvas={true}
          // ✅ melhora o comportamento no celular
          scrollWheelZoom={true}
        >
          <ZoomControl position="topleft" />
          <FlyTo center={flyCenter} zoom={base === "satelite" ? 15 : 14} />

          {/* Base */}
          {base === "mapa" && (
            <TileLayer url={tiles.mapa.url} attribution={tiles.mapa.attribution} />
          )}

          {base === "satelite" && (
            <TileLayer url={tiles.satelite.url} attribution={tiles.satelite.attribution} />
          )}

          {base === "hibrido" && (
            <>
              <TileLayer url={tiles.satelite.url} attribution={tiles.satelite.attribution} />
              {/* labels por cima (OSM) - se ficar muito forte depois eu ajusto com opacidade */}
              <TileLayer url={tiles.labels.url} attribution={tiles.labels.attribution} opacity={0.45} />
            </>
          )}

          {/* Marker meu local */}
          {myPos && (
            <Marker position={myPos}>
              <Popup>Você está aqui ✅</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "14px",
    color: "rgba(255,255,255,.92)",
    background:
      "radial-gradient(1200px 800px at 20% 10%, rgba(88, 255, 182, .10), transparent 55%)," +
      "radial-gradient(900px 700px at 90% 20%, rgba(118, 167, 255, .10), transparent 55%)," +
      "linear-gradient(180deg, #071018 0%, #050814 100%)",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "10px",
  },
  title: { fontSize: 26, fontWeight: 900, letterSpacing: 0.2 },
  sub: { opacity: 0.78, lineHeight: 1.3, marginTop: 4, fontSize: 13 },
  panel: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(12, 16, 24, .55)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 18px 50px rgba(0,0,0,.35)",
    padding: 12,
    marginBottom: 12,
  },
  row: { display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  row2: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 10 },
  col: { position: "relative" },
  lbl: { fontSize: 12, opacity: 0.75, display: "block", marginBottom: 6 },
  segment: {
    display: "flex",
    gap: 8,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    borderRadius: 14,
    padding: 6,
    flexWrap: "wrap",
  },
  segBtn: {
    border: "1px solid rgba(255,255,255,.10)",
    background: "transparent",
    color: "rgba(255,255,255,.92)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  segActive: {
    background: "linear-gradient(180deg, rgba(104,243,177,.22), rgba(104,243,177,.08))",
  },
  primaryBtn: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "linear-gradient(180deg, rgba(104,243,177,.22), rgba(104,243,177,.08))",
    color: "rgba(255,255,255,.95)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 16px 40px rgba(0,0,0,.25)",
  },
  ghostBtn: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    color: "rgba(255,255,255,.92)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  inputWrap: { display: "grid", gap: 6 },
  input: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    color: "rgba(255,255,255,.92)",
    padding: "12px 12px",
    outline: "none",
    fontWeight: 700,
  },
  mini: { fontSize: 12, opacity: 0.65 },
  dropdown: {
    position: "absolute",
    top: 74,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(10, 14, 22, .92)",
    backdropFilter: "blur(16px)",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  ddItem: {
    width: "100%",
    textAlign: "left",
    padding: "12px 12px",
    border: "0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    background: "transparent",
    color: "rgba(255,255,255,.92)",
    cursor: "pointer",
    fontWeight: 700,
  },
  coordRow: { display: "flex", gap: 8, alignItems: "center" },
  mapWrap: {
    height: "calc(100vh - 260px)",
    minHeight: 420,
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(12,16,24,.55)",
    boxShadow: "0 22px 70px rgba(0,0,0,.45)",
  },
};
