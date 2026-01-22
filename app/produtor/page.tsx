"use client";

import React, { useEffect, useMemo, useState } from "react";

type Monitoramento = {
  id: string;
  criadoEm: number;
  fazenda: string;
  talhao: string;
  cultura: "Soja" | "Milho" | "Algodão" | "Outro";
  observacao: string;
  nivel: "Verde" | "Amarelo" | "Vermelho";
};

const LS_KEY = "lfm_produtor_monitoramentos_v1";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function formatBR(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProdutorPage() {
  const [aba, setAba] = useState<"painel" | "novo" | "historico">("painel");

  const [fazenda, setFazenda] = useState("");
  const [talhao, setTalhao] = useState("");
  const [cultura, setCultura] = useState<Monitoramento["cultura"]>("Soja");
  const [nivel, setNivel] = useState<Monitoramento["nivel"]>("Verde");
  const [observacao, setObservacao] = useState("");

  const [itens, setItens] = useState<Monitoramento[]>([]);
  const [q, setQ] = useState("");

  // carrega do navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItens(JSON.parse(raw));
    } catch {}
  }, []);

  // salva no navegador
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(itens));
    } catch {}
  }, [itens]);

  const filtrados = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return itens;
    return itens.filter((m) => {
      return (
        m.fazenda.toLowerCase().includes(qq) ||
        m.talhao.toLowerCase().includes(qq) ||
        m.cultura.toLowerCase().includes(qq) ||
        m.nivel.toLowerCase().includes(qq) ||
        m.observacao.toLowerCase().includes(qq)
      );
    });
  }, [itens, q]);

  function limparFormulario() {
    setFazenda("");
    setTalhao("");
    setCultura("Soja");
    setNivel("Verde");
    setObservacao("");
  }

  function criar() {
    if (!fazenda.trim() || !talhao.trim()) {
      alert("Preencha pelo menos Fazenda e Talhão.");
      return;
    }
    const novo: Monitoramento = {
      id: uid(),
      criadoEm: Date.now(),
      fazenda: fazenda.trim(),
      talhao: talhao.trim(),
      cultura,
      observacao: observacao.trim(),
      nivel,
    };
    setItens((prev) => [novo, ...prev]);
    limparFormulario();
    setAba("historico");
  }

  function apagar(id: string) {
    if (!confirm("Apagar este monitoramento?")) return;
    setItens((prev) => prev.filter((x) => x.id !== id));
  }

  function corNivel(n: Monitoramento["nivel"]) {
    if (n === "Verde") return "rgba(86, 230, 152, 0.16)";
    if (n === "Amarelo") return "rgba(255, 209, 102, 0.18)";
    return "rgba(255, 107, 107, 0.18)";
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>👨‍🌾</div>
            <div>
              <div style={styles.title}>Produtor</div>
              <div style={styles.subtitle}>Painel e monitoramentos rápidos</div>
            </div>
          </div>

          <a href="/" style={styles.linkBack}>
            ← Voltar
          </a>
        </header>

        {/* Abas */}
        <nav style={styles.tabs}>
          <button
            onClick={() => setAba("painel")}
            style={aba === "painel" ? styles.tabOn : styles.tabOff}
          >
            Painel
          </button>
          <button
            onClick={() => setAba("novo")}
            style={aba === "novo" ? styles.tabOn : styles.tabOff}
          >
            Novo monitoramento
          </button>
          <button
            onClick={() => setAba("historico")}
            style={aba === "historico" ? styles.tabOn : styles.tabOff}
          >
            Histórico
          </button>
        </nav>

        {/* Conteúdo */}
        {aba === "painel" && (
          <section style={{ display: "grid", gap: 12 }}>
            <div style={styles.heroCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={styles.heroTitle}>LFM Agro 🌱🚜</div>
                  <div style={styles.heroText}>
                    Registre monitoramentos por talhão e acompanhe o histórico.
                    (Já funciona offline no celular.)
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button style={styles.btnPrimary} onClick={() => setAba("novo")}>
                    ➕ Novo
                  </button>
                  <button style={styles.btnSecondary} onClick={() => setAba("historico")}>
                    📋 Histórico
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>🌦️ Clima (em breve)</div>
                <div style={styles.cardText}>
                  Próximo passo: colocar cidade/coord e puxar previsão.
                </div>
                <div style={styles.miniInfo}>Status: placeholder</div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>💰 Preços (em breve)</div>
                <div style={styles.cardText}>
                  Próximo passo: soja/milho/algodão com atualização diária.
                </div>
                <div style={styles.miniInfo}>Status: placeholder</div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📌 Resumo</div>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <div style={styles.rowBetween}>
                  <span style={styles.label}>Monitoramentos salvos</span>
                  <strong>{itens.length}</strong>
                </div>
                <div style={styles.rowBetween}>
                  <span style={styles.label}>Último registro</span>
                  <strong>{itens[0] ? formatBR(itens[0].criadoEm) : "—"}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {aba === "novo" && (
          <section style={styles.card}>
            <div style={styles.cardTitle}>➕ Novo monitoramento</div>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Fazenda</label>
                <input
                  value={fazenda}
                  onChange={(e) => setFazenda(e.target.value)}
                  placeholder="Ex.: Boa Esperança"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Talhão</label>
                <input
                  value={talhao}
                  onChange={(e) => setTalhao(e.target.value)}
                  placeholder="Ex.: A03 / L32"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Cultura</label>
                <select value={cultura} onChange={(e) => setCultura(e.target.value as any)} style={styles.input}>
                  <option>Soja</option>
                  <option>Milho</option>
                  <option>Algodão</option>
                  <option>Outro</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Nível</label>
                <select value={nivel} onChange={(e) => setNivel(e.target.value as any)} style={styles.input}>
                  <option>Verde</option>
                  <option>Amarelo</option>
                  <option>Vermelho</option>
                </select>
              </div>

              <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Observação</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex.: Mancha aparecendo nas bordas, percevejo nas reboleiras, etc."
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: "flex", gap: 10, gridColumn: "1 / -1", flexWrap: "wrap" }}>
                <button style={styles.btnPrimary} onClick={criar}>
                  Salvar monitoramento
                </button>
                <button style={styles.btnSecondary} onClick={limparFormulario}>
                  Limpar
                </button>
              </div>
            </div>
          </section>
        )}

        {aba === "historico" && (
          <section style={styles.card}>
            <div style={styles.rowBetween}>
              <div>
                <div style={styles.cardTitle}>📋 Histórico</div>
                <div style={styles.cardText}>Tudo fica salvo no seu celular (localStorage).</div>
              </div>

              <button style={styles.btnSecondary} onClick={() => setAba("novo")}>
                ➕ Novo
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por fazenda, talhão, cultura, nível..."
                style={styles.input}
              />
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {filtrados.length === 0 ? (
                <div style={styles.empty}>Nenhum monitoramento encontrado.</div>
              ) : (
                filtrados.map((m) => (
                  <div key={m.id} style={{ ...styles.item, background: corNivel(m.nivel) }}>
                    <div style={styles.rowBetween}>
                      <div style={{ display: "grid", gap: 4 }}>
                        <strong style={{ fontSize: 16 }}>
                          {m.fazenda} — {m.talhao}
                        </strong>
                        <div style={{ opacity: 0.9, fontSize: 14 }}>
                          {m.cultura} • <b>{m.nivel}</b> • {formatBR(m.criadoEm)}
                        </div>
                        {m.observacao ? (
                          <div style={{ opacity: 0.95, fontSize: 14, marginTop: 6 }}>
                            {m.observacao}
                          </div>
                        ) : null}
                      </div>

                      <button style={styles.btnDanger} onClick={() => apagar(m.id)}>
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b0f14",
    color: "#e8eef7",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    padding: "28px 16px 60px",
  },
  container: { maxWidth: 860, margin: "0 auto", display: "grid", gap: 14 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: "10px 2px",
  },
  title: { fontSize: 22, fontWeight: 900, lineHeight: "22px" },
  subtitle: { fontSize: 13, opacity: 0.85, marginTop: 4 },

  linkBack: {
    color: "#e8eef7",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
  },

  tabs: { display: "flex", gap: 10, flexWrap: "wrap" },
  tabOn: {
    background: "#e8eef7",
    color: "#0b0f14",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  tabOff: {
    background: "transparent",
    color: "#e8eef7",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    opacity: 0.9,
  },

  heroCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
  },
  heroTitle: { fontSize: 18, fontWeight: 900 },
  heroText: { marginTop: 6, opacity: 0.9, maxWidth: 640, fontSize: 14 },

  grid2: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },

  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 900 },
  cardText: { marginTop: 6, opacity: 0.88, fontSize: 14 },
  miniInfo: {
    marginTop: 10,
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 12,
    opacity: 0.9,
  },

  formGrid: {
    marginTop: 12,
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, opacity: 0.9, fontWeight: 800 },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eef7",
    outline: "none",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eef7",
    outline: "none",
    fontSize: 14,
    resize: "vertical",
  },

  btnPrimary: {
    background: "#e8eef7",
    color: "#0b0f14",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    color: "#e8eef7",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  btnDanger: {
    background: "rgba(255,107,107,0.12)",
    color: "#ffb3b3",
    border: "1px solid rgba(255,107,107,0.30)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    height: 42,
  },

  rowBetween: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },

  item: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.20)",
    opacity: 0.9,
  },
};
