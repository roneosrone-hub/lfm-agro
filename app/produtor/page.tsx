"use client";

import { useRouter } from "next/navigation";

export default function ProdutorPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1f3d2b, #070b09)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(20,35,28,0.85)",
          borderRadius: 20,
          padding: 24,
          color: "#e9f5ee",
          boxShadow: "0 20px 50px rgba(0,0,0,.6)",
        }}
      >
        <h1 style={{ marginBottom: 4 }}>Produtor</h1>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>
          Painel e monitoramentos rápidos
        </p>

        <button
          onClick={() => router.push("/produtor/mapa")}
          style={btn(true)}
        >
          🧭 Mapa (grids + pontos)
        </button>

        <button style={btn(false)}>➕ Novo monitoramento (em breve)</button>
        <button style={btn(false)}>📁 Histórico (em breve)</button>
        <button
          onClick={() => router.push("/")}
          style={{ ...btn(false), marginTop: 10 }}
        >
          ← Voltar
        </button>
      </div>
    </main>
  );
}

function btn(principal: boolean) {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.08)",
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 600,
    background: principal
      ? "linear-gradient(135deg,#1fa463,#166b45)"
      : "rgba(255,255,255,.05)",
    color: "white",
  };
}
