"use client";

import { useEffect, useRef } from "react";

export default function ProdutorMapa() {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let map: any;

    async function init() {
      if (mapRef.current) return;

      const L = (await import("leaflet")).default;

      // ⚠️ Leaflet-draw precisa ser carregado DEPOIS do Leaflet, e só no client
      await import("leaflet-draw");

      // Corrige ícones (Next/Vercel costuma não achar os PNGs)
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      map = L.map("map", {
        center: [-15.601, -56.097],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      mapRef.current = map;

      const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20
      });

      const sat = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 20 }
      );

      street.addTo(map);

      L.control.layers(
        { "🗺 Mapa": street, "🛰 Satélite": sat },
        {},
        { position: "topright" }
      ).addTo(map);

      // Meu local
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);

            L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup("📍 Você está aqui")
              .openPopup();
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      // Desenho (talhão)
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new (L as any).Control.Draw({
        position: "topleft",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#00ff99" }
          },
          rectangle: { shapeOptions: { color: "#00ff99" } },
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: drawnItems
        }
      });

      map.addControl(drawControl);

      map.on((L as any).Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        const geojson = layer.toGeoJSON();
        console.log("TALHÃO (GeoJSON):", geojson);
      });
    }

    init();

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch {}
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
