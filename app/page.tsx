"use client";

import Link from "next/link";
import MobileMenu from "./_components/MobileMenu";

export default function HomePage() {
  return (
    <main className="appShell">
      {/* Background corporativo */}
      <div className="bgFx" aria-hidden="true">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="gridFx" />
        <div className="noiseFx" />
      </div>

      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <div className="brandIcon" aria-hidden>
            🌿
          </div>
          <div className="brandText">
            <div className="brandName">LFM Agro</div>
            <div className="brandDesc">Plataforma agrícola inteligente.</div>
          </div>
        </div>

        <MobileMenu />
      </header>

      {/* Conteúdo */}
      <section className="hero">
        <div className="heroLeft">
          <div className="badge">Solução completa para campo</div>

          <h1 className="heroTitle">
            <span className="heroLine">Experiência</span>
            <span className="heroLine">é a</span>
            <span className="heroLine heroAccent">Nossa Herança</span>
          </h1>

          <p className="heroText">
            Acesso rápido para <b>Produtor</b> e <b>Técnico</b>. Estrutura com seções “em breve” para você ir evoluindo o app.
          </p>

          <div className="heroBtns">
            <Link className="btnPrimary" href="/produtor">
              <span className="btnIco" aria-hidden>
                👨‍🌾
              </span>
              Entrar como Produtor
              <span className="btnArrow" aria-hidden>
                →
              </span>
            </Link>

            <Link className="btnSecondary" href="/tecnico">
              <span className="btnIco" aria-hidden>
                🧑‍🔬
              </span>
              Entrar como Técnico
              <span className="btnArrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="quickRow">
            <div className="quickItem">
              <div className="quickK">Atalhos</div>
              <div className="quickV">
                <Link className="quickLink" href="/produtor">
                  /produtor
                </Link>
                <span className="dot">•</span>
                <Link className="quickLink" href="/tecnico">
                  /tecnico
                </Link>
              </div>
            </div>
            <div className="quickItem">
              <div className="quickK">Status</div>
              <div className="quickV">MVP em evolução</div>
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="panelCard">
            <div className="panelTop">
              <div className="panelTitle">Painel</div>
              <div className="panelSub">Acesso rápido às áreas</div>
            </div>

            <div className="panelGrid">
              <Link className="panelBtn" href="/produtor">
                <div className="panelBtnTitle">Produtor</div>
                <div className="panelBtnDesc">Mapa, monitoramentos e histórico</div>
              </Link>

              <Link className="panelBtn" href="/tecnico">
                <div className="panelBtnTitle">Técnico</div>
                <div className="panelBtnDesc">Diagnóstico e planos de ação</div>
              </Link>

              <div className="panelBtn panelBtnDisabled">
                <div className="panelBtnTitle">Clima</div>
                <div className="panelBtnDesc">Em breve</div>
              </div>

              <div className="panelBtn panelBtnDisabled">
                <div className="panelBtnTitle">Preços</div>
                <div className="panelBtnDesc">Em breve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="footLine" />
        <div className="footTxt">© {new Date().getFullYear()} LFM Agro • Build MVP</div>
      </footer>
    </main>
  );
}
