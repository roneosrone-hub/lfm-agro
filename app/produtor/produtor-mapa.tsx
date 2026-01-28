"use client";

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";

export default function ProdutorMapa() {
  const mapRef = useRef<any>(null);
  const drawnRef = useRef<any>(null);
  const baseLayersRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;

    const L = require("leaflet");
    require("leaflet-draw");

    // ====== Corrige ícones padrão ======
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = icon;

    // ====== Cria mapa ======
    const map = L.map("produtor-mapa", {
      center: [-15.6, -56.1],
      zoom: 13,
      zoomControl: false,
    });

    mapRef.current = map;

    // ====== Bases ======
    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    );

    baseLayersRef.current = { street, satellite };

    // ====== Camada de desenho ======
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnRef.current = drawnItems;

    // ====== Controles ======
    new L.Control.Zoom({ position: "bottomright" }).addTo(map);

    new L.Control.Draw({
      position: "bottomright",
      draw: {
        polygon: true,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    }).addTo(map);

    // ====== Eventos ======
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const geo = layer.toGeoJSON();
      window.dispatchEvent(new CustomEvent("agros:drawCreated", { detail: geo }));
    });

    // ====== Ponte UI ======
    window.addEventListener("agros:setBase", (ev: any) => {
      const next = ev?.detail;
      if (!baseLayersRef.current) return;

      map.eachLayer((layer: any) => {
        if (layer === street || layer === satellite) {
          map.removeLayer(layer);
        }
      });

      if (next === "satelite") {
        satellite.addTo(map);
      } else {
        street.addTo(map);
      }
    });

    window.addEventListener("agros:centerMe", () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);
      });
    });

    window.addEventListener("agros:clearAll", () => {
      drawnItems.clearLayers();
      window.dispatchEvent(new CustomEvent("agros:cleared"));
    });

    window.addEventListener("agros:startDraw", () => {
      const drawer = new L.Draw.Polygon(map);
      drawer.enable();
    });
  }, []);

  return (
    <div
      id="produtor-mapa"
      style={{
        width: "100%",
        height: "100%",
        background: "#05070b",
      }}
    />
  );
}
