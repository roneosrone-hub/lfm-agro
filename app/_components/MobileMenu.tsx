"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Sec = {
  title: string;
  items?: { label: string; href: string }[];
  href?: string;
  soon?: boolean;
};

const SECOES: Sec[] = [
  { title: "Início", href: "/" },
  {
    title: "Cultivar",
    items: [
      { label: "Cultivares (em breve)", href: "/cultivar/cultivares" },
      { label: "Comparador (em breve)", href: "/cultivar/comparador" },
      { label: "Catálogo (em breve)", href: "/cultivar/catalogo" },
    ],
  },
  {
    title: "Produtor",
    items: [
      { label: "Painel", href: "/produtor" },
      { label: "Mapa (grids + pontos)", href: "/produtor/mapa" },
      { label: "Histórico (em breve)", href: "/produtor/historico" },
    ],
  },
  {
    title: "Técnico",
    items: [
      { label: "Painel", href: "/tecnico" },
      { label: "Diagnóstico (em breve)", href: "/tecnico/diagnostico" },
      { label: "Relatórios (em breve)", href: "/tecnico/relatorios" },
    ],
  },
  { title: "Produtividade (em breve)", href: "/produtividade", soon: true },
  { title: "Blog (em breve)", href: "/blog", soon: true },
  { title: "Comercial (em breve)", href: "/comercial", soon: true },
  { title: "Contato (em breve)", href: "/contato", soon: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = (t: string) => setExpanded((p) => ({ ...p, [t]: !p[t] }));

  return (
    <>
      <button className="menuBtn" onClick={() => setOpen(true)} aria-label="Abrir menu">
        ☰
      </button>

      {open && (
        <div className="drawerRoot" role="dialog" aria-modal="true">
          <div className="drawerBackdrop" onClick={() => setOpen(false)} />

          <div className="drawer">
            <div className="drawerHeader">
              <div className="drawerBrand">
                <div className="drawerLogo" aria-hidden>
                  🌿
                </div>
                <div>
                  <div className="drawerName">LFM Agro</div>
                  <div className="drawerSub">Menu</div>
                </div>
              </div>

              <button className="drawerClose" onClick={() => setOpen(false)} aria-label="Fechar menu">
                ✕
              </button>
            </div>

            <nav className="navList">
              {SECOES.map((sec) => {
                const hasItems = !!sec.items?.length;

                if (!hasItems) {
                  return (
                    <Link
                      key={sec.title}
                      className={`navItem ${sec.soon ? "navSoon" : ""}`}
                      href={sec.href || "/"}
                      onClick={() => setOpen(false)}
                    >
                      <span>{sec.title}</span>
                      <span className="navArrow">→</span>
                    </Link>
                  );
                }

                const isOpen = !!expanded[sec.title];

                return (
                  <div key={sec.title} className="navGroup">
                    <button className="navItem navGroupBtn" onClick={() => toggle(sec.title)}>
                      <span>{sec.title}</span>
                      <span className="navChevron">{isOpen ? "▲" : "▼"}</span>
                    </button>

                    {isOpen && (
                      <div className="subList">
                        {sec.items!.map((it) => (
                          <Link
                            key={it.href}
                            className="subItem"
                            href={it.href}
                            onClick={() => setOpen(false)}
                          >
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
