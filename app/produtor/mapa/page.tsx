// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapaClient = dynamic(() => Promise.resolve(MapaInner), { ssr: false });

export default function Page() {
  return <MapaClient />;
}

function MapaInner() {
  const React = require("react");
  const { useEffect, useMemo, useState } = React;

  const L = require("leaflet");
  require("leaflet-draw/dist/leaflet.draw.js");
  const turf = require("@turf/turf");

  const {
    MapContainer,
    TileLayer,
    FeatureGroup,
  } = require("react-leaflet");

  const { EditControl } = require("react-leaflet-draw");

  const center = useMemo(() => [-15.60, -56.10], []);

  const [grid, setGrid] = useState([]);

  useEffect(() => {
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = icon;
  }, []);

  function gerarGrid(latlngs) {
    const coords = latlngs[0].map((p) => [p.lng, p.lat]);
    coords.push(coords[0]);

    const polygon = turf.polygon([coords]);
    const bbox = turf.bbox(polygon);

    const cellSize = 0.03; // quanto menor, mais quadrados
    const options = { units: "kilometers" };

    const squareGrid = turf.squareGrid(bbox, cellSize, options);

    const filtrado = squareGrid.features.filter((f) =>
      turf.booleanIntersects(f, polygon)
    );

    setGrid(filtrado);
  }

  function onCreated(e) {
    if (e.layerType === "polygon") {
      const latlngs = e.layer.getLatLngs();
      gerarGrid(latlngs);
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={onCreated}
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>

      {grid.map((g, i) => (
        <FeatureGroup key={i}>
          <TileLayer />
        </FeatureGroup>
      ))}
    </MapContainer>
  );
}
