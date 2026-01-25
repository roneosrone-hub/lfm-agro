"use client";

import Link from "next/link";
import MobileMenu from "./_components/MobileMenu";

export default function HomePage() {
  return (
    <main className="lfm">
      {/* Fundo com shapes + movimento */}
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

      {/* Conteúdo */}
      <section className="lfm-hero">
        <div className="lfm-heroCard">
          <div className="lfm-kicker">Plataforma agrícola inteligente.</div>

          <h1 className="lfm-title">
            <span className="lfm-titleLine">Experiência</span>
            <span className="lfm-titleLine">é a</span>
            <span className="lfm-titleLine lfm-titleAccent">Nossa Herança</span>
          </h1>

          <p className="lfm-sub">
            Acesso rápido para <b>Produtor</b> e <b>Técnico</b>. Menu com seções “em breve” para você evoluir o app com calma.
          </p>

          <div className="lfm-actions">
            <Link className="lfm-btn lfm-btnPrimary" href="/produtor">
              👨‍🌾 <span>Entrar como Produtor</span>
            </Link>

            <Link className="lfm-btn lfm-btnGhost" href="/tecnico">
              🧑‍🔬 <span>Entrar como Técnico</span>
            </Link>
          </div>
        </div>

        {/* cartão lateral pequeno (detalhe premium) */}
        <aside className="lfm-side">
          <div className="lfm-miniCard">
            <div className="lfm-miniTitle">Atalhos</div>
            <div className="lfm-miniLinks">
              <Link className="lfm-miniLink" href="/produtor">
                /produtor
              </Link>
              <Link className="lfm-miniLink" href="/tecnico">
                /tecnico
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
