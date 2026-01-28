"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";

export default function ProdutorMapa() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [-15.601, -56.097], // MT como padrão
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
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("📍 Você está aqui")
          .openPopup();
      });
    }

    // Camada desenhável
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
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

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);

      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs = layer.getLatLngs() as any;
        console.log("Área desenhada:", latlngs);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
