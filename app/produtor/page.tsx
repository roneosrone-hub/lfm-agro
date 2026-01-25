"use client";

import Link from "next/link";

export default function ProdutorPage() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Produtor</h1>
        <p style={styles.p}>Painel e monitoramentos rápidos.</p>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <Link href="/produtor/mapa" style={{ ...styles.btn, ...styles.btnPrimary }}>
            🧭 Mapa (grides + pontos)
          </Link>

          <button style={styles.btn}>➕ Novo monitoramento (em breve)</button>
          <button style={styles.btn}>🗂️ Histórico (em breve)</button>
          <Link href="/" style={styles.btn}>← Voltar</Link>
        </div>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    padding: 18,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    background: "radial-gradient(1200px 700px at 50% 10%, rgba(120,200,120,.25), rgba(0,0,0,.92))",
    color: "white",
  },
  card: {
    width: "min(720px, 100%)",
    borderRadius: 18,
    padding: 18,
    background: "rgba(18, 22, 18, .55)",
    border: "1px solid rgba(255,255,255,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.35)",
    backdropFilter: "blur(10px)",
  },
  h1: { margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: -0.5 },
  p: { marginTop: 6, opacity: 0.78 },
  btn: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    color: "white",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 700,
  },
  btnPrimary: {
    background: "rgba(106, 168, 79, .22)",
    border: "1px solid rgba(106, 168, 79, .45)",
  },
};
