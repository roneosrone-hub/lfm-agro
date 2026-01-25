"use client";

import Link from "next/link";
import MobileMenu from "./_components/MobileMenu";

export default function HomePage() {
  return (
    <main className="lfm">
      {/* Fundo */}
      <div className="lfm-bg" aria-hidden>
        <div className="lfm-orb lfm-orbA" />
        <div className="lfm-orb lfm-orbB" />
        <div className="lfm-orb lfm-orbC" />
        <div className="lfm-ring lfm-ringA" />
        <div className="lfm-ring lfm-ringB" />
        <div className="lfm-noise" />
      </div>

      {/* Topbar */}
      <header className="lfm-top">
        <div className="lfm-brand">
          <div className="lfm-mark" aria-hidden>
            🌿
          </div>
          <div className="lfm-brandTxt">
            <div className="lfm-brandName">LFM Agro</div>
            <div className="lfm-brandTag">Plataforma agrícola inteligente.</div>
          </div>
        </div>

        <div className="lfm-topRight">
          <MobileMenu />
        </div>
      </header>

      {/* Hero */}
      <section className="lfm-hero">
        <div className="lfm-heroCard">
          {/* brilho animado tipo banner */}
          <div className="lfm-sheen" aria-hidden />

          <div className="lfm-kicker">Plataforma agrícola inteligente.</div>

          <h1 className="lfm-title">
            <span className="lfm-titleLine">Experiência</span>
            <span className="lfm-titleLine">é a</span>
            <span className="lfm-titleLine lfm-titleAccent">Nossa Herança</span>
          </h1>

          <p className="lfm-sub">
            Acesso rápido para <b>Produtor</b> e <b>Técnico</b>. Menu com seções “em breve”
            para você evoluir o app com calma.
          </p>

          <div className="lfm-actions">
            <Link className="lfm-btn lfm-btnPrimary" href="/produtor">
              👨‍🌾 <span>Entrar como Produtor</span>
            </Link>

            <Link className="lfm-btn lfm-btnGhost" href="/tecnico">
              🧑‍🔬 <span>Entrar como Técnico</span>
            </Link>
          </div>

          <div className="lfm-foot">
            <span className="lfm-footLabel">Atalhos</span>
            <span className="lfm-footLinks">/produtor • /tecnico</span>
          </div>
        </div>
      </section>
    </main>
  );
}
