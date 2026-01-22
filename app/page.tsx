export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <div style={styles.logo}>🌱</div>
          <h1 style={styles.title}>LFM Agro</h1>
        </div>

        <p style={styles.subtitle}>Plataforma agrícola inteligente.</p>

        <a href="/produtor" style={{ ...styles.btn, ...styles.btnPrimary }}>
          👨‍🌾 Entrar como Produtor
        </a>

        <a href="/tecnico" style={{ ...styles.btn, ...styles.btnGhost }}>
          👩‍🔬 Entrar como Técnico
        </a>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Atalhos</div>
          <div style={styles.linkRow}>👉 /produtor</div>
          <div style={styles.linkRow}>👉 /tecnico</div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% 0%, #1b2a2b, #090d10)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  },
  container: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 22,
  },
  title: {
    margin: 0,
    fontSize: 40,
    letterSpacing: 0.4,
  },
  subtitle: {
    margin: 0,
    opacity: 0.85,
    fontSize: 18,
  },
  btn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "16px 16px",
    borderRadius: 18,
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
    transition: "transform 0.06s ease",
  },
  btnPrimary: {
    background: "rgba(255,255,255,0.92)",
    color: "#0b1115",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  card: {
    marginTop: 4,
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  cardTitle: {
    fontWeight: 800,
    marginBottom: 10,
    opacity: 0.9,
  },
  linkRow: {
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
};
