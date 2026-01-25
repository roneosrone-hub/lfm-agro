"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Item = { label: string; href: string; soon?: boolean };

const ATALHOS: Item[] = [
  { label: "Início", href: "/" },
  { label: "Produtor", href: "/produtor" },
  { label: "Mapa (grids + pontos)", href: "/produtor/mapa" },
  { label: "Técnico", href: "/tecnico" },
];

const EM_BREVE: Item[] = [
  { label: "Histórico (em breve)", href: "/produtor/historico", soon: true },
  { label: "Clima (em breve)", href: "/clima", soon: true },
  { label: "Preços (em breve)", href: "/precos", soon: true },
  { label: "Produtividade (em breve)", href: "/produtividade", soon: true },
  { label: "Comercial (em breve)", href: "/comercial", soon: true },
  { label: "Contato (em breve)", href: "/contato", soon: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* BOTÃO DO MENU — z-index alto + position */}
      <button
        type="button"
        className="menuBtn premiumMenuBtn"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {open && (
        <div className="drawerRoot" role="dialog" aria-modal="true">
          {/* fundo clicável */}
          <button
            type="button"
            className="drawerBackdrop"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />

          <div className="drawer premiumDrawer">
            <div className="drawerHeader">
              <div className="drawerBrand">
                <div className="drawerLogo" aria-hidden>
                  🌿
                </div>
                <div>
                  <div className="drawerName">LFM Agro</div>
                  <div className="drawerSub">Atalhos</div>
                </div>
              </div>

              <button
                type="button"
                className="drawerClose"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <div className="menuSectionTitle">Acessos rápidos</div>

            <nav className="navList">
              {ATALHOS.map((it) => (
                <Link
                  key={it.href}
                  className="navItem premiumNavItem"
                  href={it.href}
                  onClick={() => setOpen(false)}
                >
                  <span>{it.label}</span>
                  <span className="navArrow">→</span>
                </Link>
              ))}
            </nav>

            <div className="menuSectionTitle" style={{ marginTop: 12 }}>
              Em breve
            </div>

            <nav className="navList">
              {EM_BREVE.map((it) => (
                <a
                  key={it.href}
                  className="navItem premiumNavItem navSoon"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <span>{it.label}</span>
                  <span className="navArrow">→</span>
                </a>
              ))}
            </nav>

            <div className="drawerFooter">
              <div className="footMini">Portal do Produtor</div>
              <div className="socialRow" aria-label="Redes sociais">
                <span className="soc">⌁</span>
                <span className="soc">▶</span>
                <span className="soc">f</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
