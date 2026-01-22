export default function TecnicoPage() {
  return (
    <main style={wrap}>
      <h1 style={h1}>🧑‍🔬 Área do Técnico</h1>
      <p style={p}>
        Aqui vai o módulo do Técnico (casos, histórico, relatório, fotos, etc.).
      </p>

      <a href="/" style={back}>
        ← Voltar
      </a>
    </main>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px",
  background: "#0b0f14",
  color: "#e8eef7",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
};

const h1: React.CSSProperties = { fontSize: 28, margin: 0, fontWeight: 900 };
const p: React.CSSProperties = { marginTop: 10, opacity: 0.9, maxWidth: 720 };

const back: React.CSSProperties = {
  display: "inline-block",
  marginTop: 18,
  color: "#e8eef7",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: "10px 12px",
  borderRadius: 12,
};
