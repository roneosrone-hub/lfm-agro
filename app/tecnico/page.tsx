export default function Tecnico() {
  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Técnico</h1>
        <p className="p">Painel técnico e registro de casos (em evolução).</p>

        <div className="stack" style={{ marginTop: 14 }}>
          <a className="btn primary" href="/tecnico">
            📋 Painel
          </a>
          <a className="btn" href="/">
            ← Voltar
          </a>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="cardTitle">Casos (em breve)</div>
          <div className="small">Aqui entra diagnóstico, fotos, recomendações e PDF depois.</div>
        </div>

        <div className="card">
          <div className="cardTitle">Relatórios (em breve)</div>
          <div className="small">Geração de relatório e exportação.</div>
        </div>
      </div>
    </div>
  );
}
