"use client";

import Link from "next/link";

export default function ProdutorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0f12",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#111827",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>
          Painel do Produtor 🌱
        </h1>

        <p style={{ opacity: 0.8 }}>
          Acesse o mapa para desenhar talhões, gerar grids e pontos de
          monitoramento.
        </p>

        <Link
          href="/produtor/mapa"
          style={{
            background: "#16a34a",
            padding: "14px 18px",
            borderRadius: 12,
            color: "white",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          🌍 Abrir Mapa de Monitoramento
        </Link>

        <div style={{ fontSize: 12, opacity: 0.6 }}>
          LFM Agro • Módulo de monitoramento
        </div>
      </div>
    </main>
  );
}
