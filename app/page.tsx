"use client";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f12", color: "white", padding: 20 }}>
      <a
        href="/produtor"
        style={{
          padding: 16,
          borderRadius: 14,
          background: "linear-gradient(135deg, #2f7d4a, #1f5f38)",
          textDecoration: "none",
          color: "white",
          fontWeight: 800,
        }}
      >
        Entrar no Produtor
      </a>
    </main>
  );
}
