"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const ATALHOS = [
  { label: "Início", href: "/" },
  { label: "Produtor", href: "/produtor" },
  { label: "Mapa (grids + pontos)", href: "/produtor/mapa" },
  { label: "Técnico", href: "/tecnico" },
];

const EM_BREVE = [
  { label: "Histórico (em breve)", href: "#" },
  { label: "Clima (em breve)", href: "#" },
  { label: "Preços (em breve)", href: "#" },
  { label: "Produtividade (em breve)", href: "#" },
  { label: "Comercial (em breve)", href: "#" },
  { label: "Contato (em breve)", href: "#" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
      <button className="menuBtn" onClick={() => setOpen(true)} aria-label="Abrir menu">
        ☰
      </button>

      {open && (
        <div className="drawerRoot" role="dialog" aria-modal="true">
          <button className="drawerBackdrop" onClick={() => setOpen(false)} aria-label="Fechar menu" />
          <div className="drawer">
            <div className="drawerHeader">
              <div className="drawerBrand">
                <div className="drawerLogo">🌿</div>
                <div>
                  <div className="drawerName">LFM Agro</div>
                  <div className="drawerSub">Atalhos</div>
                </div>
              </div>

              <button className="drawerClose" onClick={() => setOpen(false)} aria-label="Fechar">
                ✕
              </button>
            </div>

            <div className="menuSectionTitle">Acessos rápidos</div>
            <nav className="navList">
              {ATALHOS.map((it) => (
                <Link key={it.href} className="navItem" href={it.href} onClick={() => setOpen(false)}>
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
                  key={it.label}
                  className="navItem navSoon"
                  href={it.href}
                  onClick={(e) => e.preventDefault()}
                >
                  <span>{it.label}</span>
                  <span className="navArrow">→</span>
                </a>
              ))}
            </nav>

            <div className="drawerFooter">
              <div className="footMini">Portal do Produtor</div>
              <div className="socialRow">
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
