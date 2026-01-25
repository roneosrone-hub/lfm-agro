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

      <section className="homeSimple">
        <div className="homeCard">
          <div className="homeTag">Plataforma agrícola inteligente</div>

          <h1 className="homeTitle">
            Experiência é a{" "}
            <span className="homeAccent">Nossa Herança</span>
          </h1>

          <div className="homeCtas">
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

          <div className="homeHint">
            Atalhos e seções ficam no menu (☰).
          </div>
        </div>
      </section>
    </main>
  );
}
