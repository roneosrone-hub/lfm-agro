"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export default function ProdutorMapa() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [-15.88, -54.28], // MT default
      zoom: 13,
      zoomControl: true,
      keyboard: true,
      worldCopyJump: true,
    });

    mapRef.current = map;

    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap contributors",
    });

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20 }
    );

    street.addTo(map);

    L.control
      .layers(
        { Mapa: street, Satélite: satellite },
        {},
        { position: "topright" }
      )
      .addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new (L.Control as any).Draw({
      position: "topleft",
      draw: {
        polygon: true,
        polyline: false,
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const geo = layer.toGeoJSON();
      console.log("ÁREA DESENHADA:", geo);
      alert("Área salva no console (depois ligamos no banco).");
    });

    // Localização atual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("📍 Você está aqui")
          .openPopup();
      });
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
          background: "#000"
        }}
      />
    </div>
  );
}
