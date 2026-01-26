"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones padrão do Leaflet no bundler (Next/Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export default function ProMapa() {
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const satRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [cidade, setCidade] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    // Ícones
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: marker2x.src,
      iconUrl: marker1x.src,
      shadowUrl: markerShadow.src,
    });

    if (mapRef.current) return;

    // Evita travas de touch em alguns Androids
    (L as any).Browser.touch = true;

    const map = L.map("map", {
      zoomControl: true,
      attributionControl: false,
      center: [-15.78, -47.93],
      zoom: 5,
      // Garantir arrastar e gestos
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: true,
      worldCopyJump: true,
    });

    // Tiles estáveis
    const base = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        crossOrigin: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
      }
    );

    const sat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        crossOrigin: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
      }
    );

    base.addTo(map);

    mapRef.current = map;
    baseRef.current = base;
    satRef.current = sat;

    // Quando o mapa está dentro de layout com blur/overlay, no mobile ele nasce "quebrado".
    // Isso força recalcular tamanho e liberar arrasto.
    setTimeout(() => {
      map.invalidateSize(true);
      map.dragging.enable();
    }, 350);

    // Se algo por cima estiver pegando o toque, isso ajuda a “acordar”
    const onResize = () => map.invalidateSize(true);
    window.addEventListener("resize", onResize);

    // Localização
    map.on("locationfound", (e: any) => {
      setMsg("");
      const pos = e.latlng as L.LatLng;

      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker(pos).addTo(map).bindPopup("📍 Você está aqui").openPopup();

      map.setView(pos, 16, { animate: true });
    });

    map.on("locationerror", (e: any) => {
      setMsg("Não consegui acessar sua localização. Verifique a permissão do navegador.");
    });

    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  function setMapa() {
    const map = mapRef.current;
    if (!map || !baseRef.current || !satRef.current) return;
    if (map.hasLayer(satRef.current)) map.removeLayer(satRef.current);
    if (!map.hasLayer(baseRef.current)) baseRef.current.addTo(map);
  }

  function setSatelite() {
    const map = mapRef.current;
    if (!map || !baseRef.current || !satRef.current) return;
    if (map.hasLayer(baseRef.current)) map.removeLayer(baseRef.current);
    if (!map.hasLayer(satRef.current)) satRef.current.addTo(map);
  }

  function meuLocal() {
    const map = mapRef.current;
    if (!map) return;
    setMsg("Buscando sua localização...");
    map.locate({ enableHighAccuracy: true, setView: false, maxZoom: 18, timeout: 12000 });
  }

  async function buscarCidade() {
    const map = mapRef.current;
    if (!map) return;
    if (!cidade.trim()) return setMsg("Digite o nome da cidade.");

    setMsg("Buscando cidade...");
    try {
      const q = encodeURIComponent(cidade.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`, {
        headers: { "Accept": "application/json" },
      });
      const data = await res.json();

      if (!data?.length) {
        setMsg("Cidade não encontrada.");
        return;
      }

      const p = data[0];
      const pos: [number, number] = [parseFloat(p.lat), parseFloat(p.lon)];

      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker(pos).addTo(map).bindPopup(p.display_name).openPopup();

      map.setView(pos, 13, { animate: true });
      setMsg("");
    } catch {
      setMsg("Erro ao buscar cidade. Tente novamente.");
    }
  }

  function irParaCoordenada() {
    const map = mapRef.current;
    if (!map) return;

    const la = parseFloat(lat.replace(",", "."));
    const lo = parseFloat(lng.replace(",", "."));
    if (Number.isNaN(la) || Number.isNaN(lo)) {
      setMsg("Informe latitude e longitude válidas.");
      return;
    }

    const pos: [number, number] = [la, lo];

    if (markerRef.current) map.removeLayer(markerRef.current);
    markerRef.current = L.marker(pos).addTo(map).bindPopup(`${la}, ${lo}`).openPopup();

    map.setView(pos, 17, { animate: true });
    setMsg("");
  }

  // CSS isolado e sem briga
  return (
    <div className="proMapShell">
      <div id="map" className="leafletHost" />

      <div className="floatingPanel">
        <div className="panelTitle">Mapa</div>

        <div className="btnRow">
          <button className="btn" onClick={setMapa}>🗺️ Mapa</button>
          <button className="btn" onClick={setSatelite}>🛰️ Satélite</button>
          <button className="btn" onClick={meuLocal}>📍 Meu local</button>
        </div>

        <div className="subTitle">Buscar cidade</div>
        <div className="row">
          <input className="inp" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Campo Verde - MT" />
          <button className="btn small" onClick={buscarCidade}>🔎</button>
        </div>

        <div className="subTitle">Ir para coordenada</div>
        <div className="row">
          <input className="inp" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
          <input className="inp" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
        </div>
        <button className="btn full" onClick={irParaCoordenada}>📌 Ir</button>

        {msg ? <div className="msg">{msg}</div> : null}
      </div>

      <style jsx global>{`
        /* ===== ========== FIX LEAFLET + MOBILE ========== ===== */
        .proMapShell {
          position: fixed;
          inset: 0;
          background: #0b1220;
        }

        .leafletHost {
          width: 100%;
          height: 100%;
          /* garante que o mapa receba toque/arrasto */
          touch-action: pan-x pan-y;
        }

        /* evita que seu global CSS afete botões/inputs do Leaflet */
        .leaflet-container {
          font: inherit;
          background: #0b1220;
        }
        .leaflet-control-container button {
          all: unset;
        }

        /* deixa zoom (+/-) mais bonito */
        .leaflet-control-zoom a {
          width: 38px !important;
          height: 38px !important;
          line-height: 38px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0,0,0,.25) !important;
          background: rgba(255,255,255,.92) !important;
          color: #111 !important;
          box-shadow: 0 8px 18px rgba(0,0,0,.25) !important;
        }

        /* ===== ========== PAINEL FLOUTANTE ========== ===== */
        .floatingPanel {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 9999;
          width: min(92vw, 320px);
          padding: 12px;
          border-radius: 16px;
          background: rgba(15, 20, 35, .82);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 18px 40px rgba(0,0,0,.45);
          color: rgba(255,255,255,.92);
          pointer-events: auto; /* painel clicável */
        }

        /* IMPORTANTE: painel não bloqueia arrasto fora dele */
        .floatingPanel * { pointer-events: auto; }

        .panelTitle { font-weight: 800; margin-bottom: 10px; opacity: .95; }
        .subTitle { margin: 10px 0 6px; font-size: 12px; opacity: .75; }

        .btnRow {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }

        .inp {
          width: 100%;
          padding: 10px 10px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.92);
          outline: none;
        }

        .btn {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.92);
          font-weight: 800;
          cursor: pointer;
        }

        .btn:hover { background: rgba(255,255,255,.14); }
        .btn.small { width: 44px; }
        .btn.full { width: 100%; margin-top: 8px; }

        .msg {
          margin-top: 10px;
          font-size: 12px;
          opacity: .85;
        }
      `}</style>
    </div>
  );
}
