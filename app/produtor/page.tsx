"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function ProMapa() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([-15.8, -55.4], 5);

    const mapa = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
    const satelite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    );

    mapa.addTo(map);

    let baseAtual: L.TileLayer = mapa;
    let marcador: L.Marker | null = null;

    (window as any).setMapa = () => {
      map.removeLayer(baseAtual);
      mapa.addTo(map);
      baseAtual = mapa;
    };

    (window as any).setSatelite = () => {
      map.removeLayer(baseAtual);
      satelite.addTo(map);
      baseAtual = satelite;
    };

    (window as any).meuLocal = () => {
      map.locate({ enableHighAccuracy: true });
    };

    map.on("locationfound", (e: any) => {
      if (marcador) map.removeLayer(marcador);
      marcador = L.marker(e.latlng).addTo(map).bindPopup("📍 Você está aqui").openPopup();
      map.setView(e.latlng, 16);
    });

    (window as any).irParaCoordenada = () => {
      const lat = (document.getElementById("lat") as HTMLInputElement).value;
      const lng = (document.getElementById("lng") as HTMLInputElement).value;
      if (!lat || !lng) return alert("Informe latitude e longitude");
      const pos: [number, number] = [parseFloat(lat), parseFloat(lng)];
      map.setView(pos, 17);
      if (marcador) map.removeLayer(marcador);
      marcador = L.marker(pos).addTo(map);
    };

    (window as any).buscarCidade = async () => {
      const cidade = (document.getElementById("cidade") as HTMLInputElement).value;
      if (!cidade) return;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cidade}`);
      const data = await res.json();
      if (!data.length) return alert("Local não encontrado");
      const pos: [number, number] = [data[0].lat, data[0].lon];
      map.setView(pos, 13);
      if (marcador) map.removeLayer(marcador);
      marcador = L.marker(pos).addTo(map).bindPopup(data[0].display_name).openPopup();
    };

    mapRef.current = map;
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#0b1220" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />

      <div style={{
        position: "fixed", top: 14, right: 14, zIndex: 999,
        background: "rgba(15,20,35,.9)", backdropFilter: "blur(10px)",
        borderRadius: 14, padding: 10, display: "flex",
        flexDirection: "column", gap: 8, boxShadow: "0 10px 30px rgba(0,0,0,.4)"
      }}>
        <button onClick={() => (window as any).setMapa()}>🗺️ Mapa</button>
        <button onClick={() => (window as any).setSatelite()}>🛰️ Satélite</button>
        <button onClick={() => (window as any).meuLocal()}>📍 Meu local</button>

        <div style={{ display: "flex", gap: 6 }}>
          <input id="lat" placeholder="Latitude" />
          <input id="lng" placeholder="Longitude" />
        </div>
        <button onClick={() => (window as any).irParaCoordenada()}>📌 Ir para coordenada</button>

        <input id="cidade" placeholder="Pesquisar cidade" />
        <button onClick={() => (window as any).buscarCidade()}>🔍 Buscar cidade</button>
      </div>
    </div>
  );
}
