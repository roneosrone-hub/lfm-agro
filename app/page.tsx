export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background: "#0b0f14",
        color: "#e8eef7",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 42, lineHeight: "42px" }}>🌱</div>
          <h1 style={{ fontSize: 40, margin: 0, fontWeight: 800 }}>
            LFM Agro
          </h1>
        </div>

        <p style={{ marginTop: 10, opacity: 0.9, fontSize: 16 }}>
          Plataforma agrícola inteligente.
        </p>

        <div style={{ marginTop: 26, display: "grid", gap: 12 }}>
          <a href="/produtor" style={btnPrimary}>
            👨‍🌾 Entrar como Produtor
          </a>

          <a href="/tecnico" style={btnSecondary}>
            🧑‍🔬 Entrar como Técnico
          </a>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            fontSize: 14,
            opacity: 0.95,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Atalhos</div>
          <div style={{ display: "grid", gap: 6 }}>
            <span>👉 /produtor</span>
            <span>👉 /tecnico</span>
          </div>
        </div>
      </div>
    </main>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "14px 16px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 16,
  lineHeight: "16px",
  transition: "transform 0.06s ease",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#e8eef7",
  color: "#0b0f14",
  border: "1px solid rgba(255,255,255,0.12)",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "#e8eef7",
  border: "1px solid rgba(255,255,255,0.18)",
};
