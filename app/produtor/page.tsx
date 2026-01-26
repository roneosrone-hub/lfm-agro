"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones padrão do Leaflet no bundler (Next/Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type CellStatus = 0 | 1 | 2; // 0=verde, 1=amarelo, 2=vermelho

function statusStyle(status: CellStatus) {
  // sem depender de tailwind dentro do leaflet
  if (status === 0) return { color: "#22c55e", fillColor: "#22c55e" }; // verde
  if (status === 1) return { color: "#eab308", fillColor: "#eab308" }; // amarelo
  return { color: "#ef4444", fillColor: "#ef4444" }; // vermelho
}

function metersToLatDegrees(m: number) {
  // ~111.320 km por grau de latitude
  return m / 111_320;
}

function metersToLngDegrees(m: number, atLat: number) {
  // longitude varia com o cos(lat)
  const cos = Math.cos((atLat * Math.PI) / 180);
  const metersPerDegree = 111_320 * Math.max(cos, 0.00001);
  return m / metersPerDegree;
}

export default function ProdutorPage() {
  const mapRef = useRef<L.Map | null>(null);
  const gridGroupRef = useRef<L.LayerGroup | null>(null);

  const [cellMeters, setCellMeters] = useState<number>(250); // tamanho do grid (m)
  const [msg, setMsg] = useState<string>("");

  // Tiles
  const baseUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const [mode, setMode] = useState<"mapa" | "sat">("mapa");

  useEffect(() => {
    // Ícones Leaflet
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: (marker2x as any).src ?? marker2x,
      iconUrl: (marker1x as any).src ?? marker1x,
      shadowUrl: (markerShadow as any).src ?? markerShadow,
    });

    if (mapRef.current) return;

    // Evita travas de touch em alguns Androids
    (L as any).Browser.touch = true;

    const map = L.map("map", {
      zoomControl: true,
      attributionControl: false,
      center: [-15.78, -47.93], // Brasil
      zoom: 5,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: true,
      worldCopyJump: true,
    });

    const baseLayer = L.tileLayer(baseUrl, { maxZoom: 20 });
    const satLayer = L.tileLayer(satUrl, { maxZoom: 20 });

    baseLayer.addTo(map);

    // Guarda refs
    mapRef.current = map;
    gridGroupRef.current = L.layerGroup().addTo(map);

    // Controles (botões canto direito)
    const Control = L.Control.extend({
      options: { position: "topright" as const },
      onAdd: function () {
        const div = L.DomUtil.create("div");
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.gap = "8px";

        const btnMapa = L.DomUtil.create("button", "", div);
        btnMapa.innerHTML = "🗺️ Mapa";
        btnMapa.style.padding = "8px 10px";
        btnMapa.style.border = "1px solid #ccc";
        btnMapa.style.background = "white";
        btnMapa.style.borderRadius = "8px";
        btnMapa.style.cursor = "pointer";

        const btnSat = L.DomUtil.create("button", "", div);
        btnSat.innerHTML = "🛰️ Satélite";
        btnSat.style.padding = "8px 10px";
        btnSat.style.border = "1px solid #ccc";
        btnSat.style.background = "white";
        btnSat.style.borderRadius = "8px";
        btnSat.style.cursor = "pointer";

        const btnLocal = L.DomUtil.create("button", "", div);
        btnLocal.innerHTML = "📍 Meu local";
        btnLocal.style.padding = "8px 10px";
        btnLocal.style.border = "1px solid #ccc";
        btnLocal.style.background = "white";
        btnLocal.style.borderRadius = "8px";
        btnLocal.style.cursor = "pointer";

        // evita o mapa mexer quando clica nos botões
        L.DomEvent.disableClickPropagation(div);

        btnMapa.onclick = () => {
          map.eachLayer((ly: any) => {
            if (ly instanceof L.TileLayer) map.removeLayer(ly);
          });
          baseLayer.addTo(map);
          setMode("mapa");
        };

        btnSat.onclick = () => {
          map.eachLayer((ly: any) => {
            if (ly instanceof L.TileLayer) map.removeLayer(ly);
          });
          satLayer.addTo(map);
          setMode("sat");
        };

        btnLocal.onclick = () => {
          map.locate({ setView: true, maxZoom: 16 });
        };

        return div;
      },
    });

    map.addControl(new Control());

    map.on("locationfound", (e: any) => {
      const radius = e.accuracy || 30;
      L.circleMarker(e.latlng, { radius: 8, color: "#2563eb" }).addTo(map);
      L.circle(e.latlng, { radius, color: "#60a5fa", fillOpacity: 0.15 }).addTo(map);
      setMsg(`Local encontrado (precisão ~${Math.round(radius)} m)`);
    });

    map.on("locationerror", () => {
      setMsg("Não consegui acessar sua localização (permissão do navegador).");
    });
  }, []);

  function clearGrid() {
    if (!gridGroupRef.current) return;
    gridGroupRef.current.clearLayers();
    setMsg("Grid removido.");
  }

  function generateGrid() {
    const map = mapRef.current;
    const group = gridGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const b = map.getBounds();
    const south = b.getSouth();
    const north = b.getNorth();
    const west = b.getWest();
    const east = b.getEast();

    const stepLat = metersToLatDegrees(cellMeters);

    let cellCount = 0;

    // Percorre latitude
    for (let lat = south; lat < north; lat += stepLat) {
      // usa latitude do “meio” da linha pra calcular stepLng
      const latMid = lat + stepLat / 2;
      const stepLng = metersToLngDegrees(cellMeters, latMid);

      for (let lng = west; lng < east; lng += stepLng) {
        const bounds: L.LatLngBoundsExpression = [
          [lat, lng],
          [Math.min(lat + stepLat, north), Math.min(lng + stepLng, east)],
        ];

        let status: CellStatus = 0;

        const rect = L.rectangle(bounds, {
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.18,
          ...statusStyle(status),
        });

        // guarda meta no próprio layer
        (rect as any)._cellMeta = {
          status,
          bounds,
        };

        rect.on("click", () => {
          const meta = (rect as any)._cellMeta as { status: CellStatus; bounds: any };
          meta.status = ((meta.status + 1) % 3) as CellStatus; // 0->1->2->0
          rect.setStyle({
            ...statusStyle(meta.status),
            fillOpacity: 0.22,
            weight: 1,
          });
        });

        rect.addTo(group);
        cellCount++;
      }
    }

    setMsg(`Grid gerado: ${cellCount} células (~${cellMeters} m). Clique nas células para classificar.`);
  }

  async function exportGridJSON() {
    const group = gridGroupRef.current;
    if (!group) return;

    const cells: any[] = [];
    group.eachLayer((layer: any) => {
      const meta = layer?._cellMeta;
      if (!meta) return;
      const b = meta.bounds as L.LatLngBoundsExpression;
      const status = meta.status as CellStatus;

      cells.push({
        status,
        bounds: b,
      });
    });

    const payload = {
      cellMeters,
      mode,
      createdAt: new Date().toISOString(),
      cells,
    };

    const text = JSON.stringify(payload, null, 2);

    try {
      await navigator.clipboard.writeText(text);
      setMsg("✅ JSON do grid copiado para a área de transferência.");
    } catch {
      setMsg("Não consegui copiar automaticamente. (No celular às vezes bloqueia.)");
      // fallback simples: abre uma nova aba com o JSON
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  }

  const hint = useMemo(() => {
    return "1) Ajuste o tamanho (m)  2) Clique em GERAR  3) Clique nas células: verde→amarelo→vermelho";
  }, []);

  return (
    <main style={{ padding: 14, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Área do Produtor • Grid de Amostragem</h1>
      <p style={{ marginTop: 0, opacity: 0.8, marginBottom: 10 }}>{hint}</p>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 10,
          padding: 10,
          border: "1px solid rgba(0,0,0,.12)",
          borderRadius: 12,
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Tamanho do grid (m)
          <input
            type="number"
            value={cellMeters}
            min={50}
            max={5000}
            step={50}
            onChange={(e) => setCellMeters(Number(e.target.value || 250))}
            style={{
              width: 110,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,.2)",
            }}
          />
        </label>

        <button
          onClick={generateGrid}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.2)",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🧩 Gerar grid
        </button>

        <button
          onClick={clearGrid}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.2)",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🧽 Limpar
        </button>

        <button
          onClick={exportGridJSON}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.2)",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          📤 Exportar JSON
        </button>

        <span style={{ opacity: 0.75 }}>{msg}</span>
      </div>

      <div
        id="map"
        style={{
          height: "70vh",
          minHeight: 520,
          width: "100%",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,.12)",
        }}
      />
    </main>
  );
}
