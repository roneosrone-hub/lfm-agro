"use client";

export default function ProdutorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 600px at 20% 0%, rgba(55,140,95,.35), rgba(11,15,18,1))",
        color: "white",
        padding: 18,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(0,0,0,.35)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 22,
          padding: 22,
          boxShadow: "0 24px 70px rgba(0,0,0,.55)",
        }}
      >
        <h1 style={{ fontSize: 44, margin: 0, lineHeight: 1.05 }}>Produtor</h1>
        <p style={{ opacity: 0.75, marginTop: 6 }}>Painel e monitoramentos rápidos.</p>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <a href="/produtor/mapa" style={btnPrimary}>🧭 Mapa (grides + pontos)</a>

          <button style={btnDisabled} disabled>➕ Novo monitoramento (em breve)</button>
          <button style={btnDisabled} disabled>🗂️ Histórico (em breve)</button>

          <a href="/" style={btnSecondary}>← Voltar</a>
        </div>
      </div>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 16,
  background: "linear-gradient(135deg, #2f7d4a, #1f5f38)",
  color: "white",
  fontWeight: 800,
  textAlign: "center",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,.10)",
};

const btnSecondary: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,.06)",
  color: "white",
  fontWeight: 700,
  textAlign: "center",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,.14)",
};

const btnDisabled: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,.04)",
  color: "rgba(255,255,255,.65)",
  fontWeight: 700,
  textAlign: "center",
  border: "1px solid rgba(255,255,255,.10)",
};
