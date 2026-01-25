export default function Produtor() {
  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Produtor</h1>
        <p className="p">Painel e monitoramentos rápidos.</p>

        <div className="stack" style={{ marginTop: 14 }}>
          <a className="btn primary" href="/produtor?tab=novo">
            ➕ Novo monitoramento
          </a>
          <a className="btn" href="/produtor?tab=historico">
            🗂️ Histórico
          </a>
          <a className="btn" href="/">
            ← Voltar
          </a>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="cardTitle">Clima (em breve)</div>
          <div className="small">Próximo passo: colocar cidade/coord e puxar previsão.</div>
        </div>

        <div className="card">
          <div className="cardTitle">Preços (em breve)</div>
          <div className="small">Próximo passo: soja/milho/algodão com atualização.</div>
        </div>
      </div>
    </div>
  );
}
