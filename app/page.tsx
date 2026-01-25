"use client";

import Link from "next/link";
import MobileMenu from "./_components/MobileMenu";

export default function HomePage() {
  return (
    <div className="lfm-wrap lfm-heroBg">
      {/* shapes decorativas */}
      <div className="lfm-shape lfm-shapeA" aria-hidden />
      <div className="lfm-shape lfm-shapeB" aria-hidden />
      <div className="lfm-shape lfm-shapeC" aria-hidden />
      <div className="lfm-ring lfm-ringA" aria-hidden />
      <div className="lfm-ring lfm-ringB" aria-hidden />

      <div className="lfm-topbar">
        <div className="lfm-brand">
          <div className="lfm-logo" aria-hidden>🌿</div>
          <div>
            <div className="lfm-brandTitle">LFM Agro</div>
            <div className="lfm-brandSub">Plataforma agrícola inteligente.</div>
          </div>
        </div>

        <MobileMenu />
      </div>

      <div className="lfm-heroCard">
        <div className="lfm-heroTextWrap">
          <div className="lfm-heroKicker">Plataforma agrícola inteligente.</div>

          {/* TEXTO “MEXENDO” */}
          <h1 className="lfm-heroTitle">
            <span className="lfm-heroLine">Experiência é a</span>
            <span className="lfm-heroLine lfm-heroHighlight">Nossa Herança</span>
          </h1>

          <p className="lfm-heroSub">
            Acesso rápido para <b>Produtor</b> e <b>Técnico</b>. Menu com seções “em breve” para você ir evoluindo o app.
          </p>
        </div>

        <div className="lfm-heroActions">
          <Link className="lfm-btn lfm-btnPrimary" href="/produtor">
            👨‍🌾 Entrar como Produtor
          </Link>

          <Link className="lfm-btn" href="/tecnico">
            🧑‍🔬 Entrar como Técnico
          </Link>
        </div>
      </div>
    </div>
  );
}
