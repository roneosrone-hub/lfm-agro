"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones padrão do Leaflet no bundler (Next/Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type GridSize = 25 | 50 | 100 | 200;

function metersPerPixel(lat: number, zoom: number) {
  // WebMercator: 156543.03392 m/px no equador no zoom 0
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

export default function ProdutorMapa() {
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const satRef = useRef<L.TileLayer | null>(null);
  const pinRef = useRef<L.Marker | null>(null);

  const gridGroupRef = useRef<L.LayerGroup | null>(null);
  const selGroupRef = useRef<L.LayerGroup | null>(null);

  const [gridOn, setGridOn] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>(50);
  const [isSat, setIsSat] = useState(false);

  // guarda células selecionadas (id string)
  const [selected, setSelected] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    // Ícones
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: marker2x.src,
      iconUrl: marker1x.src,
      shadowUrl: markerShadow.src,
    });

    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: true,
      attributionControl: false,
      center: [-15.78, -47.93],
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

    mapRef.current = map;

    // Base (OSM)
    const base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
    }).addTo(map);
    baseRef.current = base;

    // Satélite (Esri)
    const sat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20 }
    );
    satRef.current = sat;

    // camadas
    gridGroupRef.current = L.layerGroup().addTo(map);
    selGroupRef.current = L.layerGroup().addTo(map);

    // redesenha grid quando mexe/zooma
    const redraw = () => {
      if (!gridOn) return;
      drawGrid();
      drawSelectedCells(); // mantém seleção visível
    };

    map.on("moveend zoomend", redraw);

    // click/tap: selecionar célula
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!gridOn) return;

      const z = map.getZoom();
      const lat = e.latlng.lat;
      const mpp = metersPerPixel(lat, z);
      const stepPx = Math.max(6, Math.round(gridSize / mpp)); // evita grid “invisível”
      const p = map.project(e.latlng, z);

      const x0 = Math.floor(p.x / stepPx) * stepPx;
      const y0 = Math.floor(p.y / stepPx) * stepPx;
      const x1 = x0 + stepPx;
      const y1 = y0 + stepPx;

      // id único por zoom + tamanho + coords
      const id = `${gridSize}|${z}|${x0}|${y0}`;

      setSelected((prev) => {
        const s = new Set(prev);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        return Array.from(s);
      });

      // desenha imediatamente
      setTimeout(drawSelectedCells, 0);
    });

    // função de grid
    function drawGrid() {
      const map = mapRef.current!;
      const group = gridGroupRef.current!;
      group.clearLayers();

      const z = map.getZoom();
      const centerLat = map.getCenter().lat;
      const mpp = metersPerPixel(centerLat, z);
      const stepPx = Math.max(6, Math.round(gridSize / mpp));

      const b = map.getPixelBounds();
      const minX = Math.floor(b.min.x / stepPx) * stepPx;
      const maxX = Math.ceil(b.max.x / stepPx) * stepPx;
      const minY = Math.floor(b.min.y / stepPx) * stepPx;
      const maxY = Math.ceil(b.max.y / stepPx) * stepPx;

      // linhas verticais
      for (let x = minX; x <= maxX; x += stepPx) {
        const a = map.unproject(L.point(x, minY), z);
        const c = map.unproject(L.point(x, maxY), z);
        L.polyline([a, c], { weight: 1, opacity: 0.35 }).addTo(group);
      }

      // linhas horizontais
      for (let y = minY; y <= maxY; y += stepPx) {
        const a = map.unproject(L.point(minX, y), z);
        const c = map.unproject(L.point(maxX, y), z);
        L.polyline([a, c], { weight: 1, opacity: 0.35 }).addTo(group);
      }
    }

    function drawSelectedCells() {
      const map = mapRef.current!;
      const group = selGroupRef.current!;
      group.clearLayers();

      const z = map.getZoom();
      const centerLat = map.getCenter().lat;
      const mpp = metersPerPixel(centerLat, z);
      const stepPx = Math.max(6, Math.round(gridSize / mpp));

      for (const id of selectedSet) {
        const [sz, zz, xs, ys] = id.split("|");
        if (Number(sz) !== gridSize) continue;
        if (Number(zz) !== z) continue;

        const x0 = Number(xs);
        const y0 = Number(ys);
        const x1 = x0 + stepPx;
        const y1 = y0 + stepPx;

        const a = map.unproject(L.point(x0, y0), z);
        const b = map.unproject(L.point(x1, y1), z);

        L.rectangle([a, b], { weight: 2, opacity: 0.8, fillOpacity: 0.12 }).addTo(group);
      }
    }

    // deixa funções acessíveis dentro do effect
    (window as any).__lfm_drawGrid = drawGrid;
    (window as any).__lfm_drawSelectedCells = drawSelectedCells;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridOn, gridSize]);

  // handlers UI
  const goMyLocation = async () => {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste aparelho/navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], Math.max(map.getZoom(), 16));

        if (!pinRef.current) {
          pinRef.current = L.marker([lat, lng]).addTo(map);
        } else {
          pinRef.current.setLatLng([lat, lng]);
        }
      },
      () => alert("Não consegui pegar sua localização. Verifique as permissões do navegador.")
    );
  };

  const toggleBaseSat = () => {
    const map = mapRef.current;
    if (!map || !baseRef.current || !satRef.current) return;

    if (isSat) {
      map.removeLayer(satRef.current);
      baseRef.current.addTo(map);
      setIsSat(false);
    } else {
      map.removeLayer(baseRef.current);
      satRef.current.addTo(map);
      setIsSat(true);
    }
  };

  const toggleGrid = () => {
    setGridOn((v) => {
      const next = !v;
      setTimeout(() => {
        if (next) (window as any).__lfm_drawGrid?.();
      }, 0);
      return next;
    });
  };

  const clearSelection = () => setSelected([]);

  return (
    <div style={{ height: "100dvh", width: "100%", position: "relative" }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />

      {/* Controles */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 9999,
        }}
      >
        <button style={btnStyle} onClick={toggleBaseSat}>
          {isSat ? "🗺️ Mapa" : "🛰️ Satélite"}
        </button>

        <button style={btnStyle} onClick={goMyLocation}>
          📍 Meu local
        </button>

        <button style={btnStyle} onClick={toggleGrid}>
          {gridOn ? "🔳 Grid: ON" : "⬜ Grid: OFF"}
        </button>

        {gridOn && (
          <>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value) as GridSize)}
              style={{
                ...btnStyle,
                padding: "10px 12px",
                appearance: "auto",
              }}
            >
              <option value={25}>Grid 25 m</option>
              <option value={50}>Grid 50 m</option>
              <option value={100}>Grid 100 m</option>
              <option value={200}>Grid 200 m</option>
            </select>

            <button style={btnStyle} onClick={clearSelection}>
              🧹 Limpar seleção ({selected.length})
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};
