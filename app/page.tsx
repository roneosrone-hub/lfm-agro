"use client";

import Link from "next/link";
import MobileMenu from "./_components/MobileMenu";

export default function HomePage() {
  return (
    <main className="appShell premium">
      <div className="bgFx" aria-hidden="true">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="gridFx" />
        <div className="noiseFx" />
      </div>

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

      <section className="heroPremium">
        <div className="heroBanner">
          <div className="bannerGlow" aria-hidden />
          <div className="bannerFrame" aria-hidden />
          <div className="bannerTopline">Plataforma agrícola inteligente.</div>

          <h1 className="titlePremium">
            <span className="tLine">Experiência</span>
            <span className="tLine">é a</span>
            <span className="tLine tAccent">Nossa Herança</span>
          </h1>

          <p className="subtitlePremium">
            Acesso rápido para <b>Produtor</b> e <b>Técnico</b>. Menu com seções “em breve” para você ir evoluindo o app.
          </p>

          <div className="ctaRow">
            <Link className="ctaPrimary" href="/produtor">
              <span className="ctaIcon" aria-hidden>
                👨‍🌾
              </span>
              Entrar como Produtor
              <span className="ctaArrow" aria-hidden>
                →
              </span>
            </Link>

            <Link className="ctaGhost" href="/tecnico">
              <span className="ctaIcon" aria-hidden>
                🧑‍🔬
              </span>
              Entrar como Técnico
              <span className="ctaArrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="miniStats">
            <div className="miniCard">
              <div className="miniK">Atalhos</div>
              <div className="miniV">
                <Link className="miniLink" href="/produtor">
                  /produtor
                </Link>
                <span className="dot">•</span>
                <Link className="miniLink" href="/tecnico">
                  /tecnico
                </Link>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniK">Status</div>
              <div className="miniV">Build MVP premium</div>
            </div>
          </div>
        </div>

        <aside className="sideCard">
          <div className="sideHead">
            <div className="sideTitle">Acesso rápido</div>
            <div className="sideSub">Entradas principais</div>
          </div>

          <div className="sideGrid">
            <Link className="sideBtn sideBtnStrong" href="/produtor">
              <div className="sideBtnT">Produtor</div>
              <div className="sideBtnD">Mapa, monitoramentos e histórico</div>
            </Link>

            <Link className="sideBtn" href="/tecnico">
              <div className="sideBtnT">Técnico</div>
              <div className="sideBtnD">Diagnóstico e planos de ação</div>
            </Link>

            <div className="sideBtn sideBtnOff">
              <div className="sideBtnT">Clima</div>
              <div className="sideBtnD">Em breve</div>
            </div>

            <div className="sideBtn sideBtnOff">
              <div className="sideBtnT">Preços</div>
              <div className="sideBtnD">Em breve</div>
            </div>
          </div>
        </aside>
      </section>

      <footer className="foot">
        <div className="footLine" />
        <div className="footTxt">© {new Date().getFullYear()} LFM Agro • Interface Premium</div>
      </footer>
    </main>
  );
}
