// app/page.tsx
"use client";

import React from "react";
import MobileMenu from "./_components/MobileMenu";

export default function Home() {
  return (
    <main className="lfm-page">
      <header className="lfm-topbar">
        <div className="lfm-brand">
          <div className="lfm-logo" aria-hidden>
            🌱
          </div>
          <div className="lfm-brandText">
            <div className="lfm-brandName">LFM Agro</div>
            <div className="lfm-brandTag">Plataforma agrícola inteligente</div>
          </div>
        </div>

        <MobileMenu />
      </header>

      <section className="lfm-hero">
        <div className="lfm-heroCard">
          <div className="lfm-heroTitle">
            Monitoramento simples,
            <span className="lfm-heroHighlight"> decisão rápida</span>.
          </div>

          <p className="lfm-heroDesc">
            Um painel leve pra produtor e técnico registrarem monitoramentos,
            histórico e (depois) mapas, clima e preços.
          </p>

          <div className="lfm-actions">
            <a className="lfm-btn lfm-btnPrimary" href="/produtor">
              👨‍🌾 Entrar como Produtor
            </a>
            <a className="lfm-btn lfm-btnGhost" href="/tecnico">
              🧑‍🔬 Entrar como Técnico
            </a>
          </div>

          <div className="lfm-shortcuts">
            <div className="lfm-shortcutsTitle">Atalhos</div>
            <div className="lfm-shortcutsList">
              <a className="lfm-chip" href="/produtor">
                👉 /produtor
              </a>
              <a className="lfm-chip" href="/tecnico">
                👉 /tecnico
              </a>
            </div>
          </div>
        </div>

        <div className="lfm-bgBlob lfm-bgBlobA" aria-hidden />
        <div className="lfm-bgBlob lfm-bgBlobB" aria-hidden />
      </section>
    </main>
  );
}
