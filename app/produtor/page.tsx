export default function Produtor() {
  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.hTitle}>👨‍🌾 Produtor</div>
          <div style={styles.hSub}>Painel e monitoramentos rápidos</div>
        </div>

        <a href="/" style={styles.back}>
          ← Voltar
        </a>
      </div>

      <div style={styles.tabs}>
        <div style={{ ...styles.tab, ...styles.tabOn }}>Painel</div>
        <div style={styles.tab}>Novo monitoramento</div>
        <div style={styles.tab}>Histórico</div>
      </div>

      <section style={styles.card}>
        <div style={styles.cardTitle}>LFM Agro 🌱🚜</div>
        <div style={styles.cardText}>
          Registre monitoramentos por talhão e acompanhe o histórico. (Já funciona
          offline no celular.)
        </div>

        <div style={styles.row}>
          <a href="/produtor/mapa" style={{ ...styles.btn, ...styles.btnPrimary }}>
            🗺️ Ir para o Mapa
          </a>
          <a href="/produtor/historico" style={{ ...styles.btn, ...styles.btnGhost }}>
            📋 Histórico
          </a>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>☁️ Clima (em breve)</div>
        <div style={styles.cardText}>
          Próximo passo: colocar cidade/coord e puxar previsão.
        </div>
        <div style={styles.badge}>Status: placeholder</div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>💰 Preços (em breve)</div>
        <div style={styles.cardText}>
          Próximo passo: soja/milho/algodão com atualização diária.
        </div>
        <div style={styles.badge}>Status: placeholder</div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>📌 Resumo</div>
        <div style={styles.summaryRow}>
          <div style={styles.cardText}>Monitoramentos salvos</div>
          <div style={styles.summaryVal}>0</div>
        </div>
        <div style={styles.summaryRow}>
          <div style={styles.cardText}>Último registro</div>
          <div style={styles.summaryVal}>—</div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% 0%, #1b2a2b, #090d10)",
    color: "#fff",
    padding: 16,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  hTitle: { fontSize: 28, fontWeight: 900, lineHeight: 1.1 },
  hSub: { opacity: 0.8, marginTop: 4 },
  back: {
    textDecoration: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  tabs: { display: "flex", gap: 10, marginBottom: 14 },
  tab: {
    padding: "10px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 800,
    opacity: 0.85,
  },
  tabOn: {
    background: "rgba(255,255,255,0.90)",
    color: "#0b1115",
    opacity: 1,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: 900, marginBottom: 8 },
  cardText: { opacity: 0.85, lineHeight: 1.4 },
  row: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  btn: {
    flex: "1 1 180px",
    textAlign: "center",
    padding: "14px 14px",
    borderRadius: 16,
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 900,
  },
  btnPrimary: { background: "rgba(255,255,255,0.92)", color: "#0b1115" },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  badge: {
    marginTop: 10,
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 800,
    opacity: 0.9,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  summaryVal: { fontWeight: 900 },
};
