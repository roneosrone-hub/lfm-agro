"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b0f12, #0f1c16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(15,25,20,0.9)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          border: "1px solid rgba(80,140,90,0.3)",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>🌱 LFM Agro</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Plataforma de monitoramento agrícola
        </p>

        <a href="/produtor" style={btnPrimary}>
          🚜 Área do Produtor
        </a>

        <a href="/produtor/mapa" style={btnSecondary}>
          🗺️ Mapa de Monitoramento
        </a>
      </div>
    </main>
  );
}

const btnPrimary = {
  display: "block",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #2f7d4a, #1f5f38)",
  color: "white",
  fontWeight: "bold",
  textAlign: "center" as const,
  textDecoration: "none",
  marginBottom: "12px",
};

const btnSecondary = {
  display: "block",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  textAlign: "center" as const,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.15)",
};
