import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 30 }}>
      <h1>LFM Agro 🌱🚜</h1>
      <p>Escolha um perfil:</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Link href="/produtor">
          <button style={btn}>👨‍🌾 Produtor</button>
        </Link>

        <Link href="/tecnico">
          <button style={btn}>🧑‍🔬 Técnico</button>
        </Link>
      </div>
    </main>
  );
}

const btn = {
  padding: "14px 22px",
  borderRadius: 10,
  border: "none",
  background: "#16a34a",
  color: "white",
  fontSize: 16
};
