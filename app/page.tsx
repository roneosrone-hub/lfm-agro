import MobileMenu from "./_components/MobileMenu";

export default function Home() {
  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="brandIcon">🌿</div>
          <div>
            <div className="brandTitle">LFM Agro</div>
            <div className="brandSub">Plataforma agrícola inteligente.</div>
          </div>
        </div>

        <MobileMenu />
      </div>

      <div className="hero">
        <h1 className="h1">
          LFM <span>Agro</span>
        </h1>
        <p className="p">
          Acesso rápido para Produtor e Técnico. Menu com seções “em breve” para você ir evoluindo o app.
        </p>

        <div className="stack">
          <a className="btn primary" href="/produtor">
            👨‍🌾 Entrar como Produtor
          </a>

          <a className="btn" href="/tecnico">
            🧑‍🔬 Entrar como Técnico
          </a>
        </div>

        <div className="card">
          <div className="cardTitle">Atalhos</div>
          <div className="small">/produtor</div>
          <div className="small">/tecnico</div>
        </div>
      </div>
    </div>
  );
}
