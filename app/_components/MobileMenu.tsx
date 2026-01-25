"use client";

import React, { useMemo, useState } from "react";

type Item = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const items: Item[] = useMemo(
    () => [
      { label: "Início", href: "/" },
      {
        label: "Cultivar",
        children: [
          { label: "Cultivares (em breve)", href: "/" },
          { label: "Comparador (em breve)", href: "/" },
          { label: "Catálogo (em breve)", href: "/" },
        ],
      },
      {
        label: "Produtor",
        children: [
          { label: "Painel", href: "/produtor" },
          { label: "Novo monitoramento", href: "/produtor?tab=novo" },
          { label: "Histórico", href: "/produtor?tab=historico" },
        ],
      },
      {
        label: "Técnico",
        children: [
          { label: "Painel", href: "/tecnico" },
          { label: "Casos (em breve)", href: "/tecnico" },
          { label: "Relatórios (em breve)", href: "/tecnico" },
        ],
      },
      { label: "Produtividade (em breve)", href: "/" },
      { label: "Blog (em breve)", href: "/" },
      { label: "Comercial (em breve)", href: "/" },
      { label: "Contato (em breve)", href: "/" },
    ],
    []
  );

  function toggleGroup(label: string) {
    setExpanded((cur) => (cur === label ? null : label));
  }

  return (
    <>
      <button className="lfm-menuBtn" aria-label="Abrir menu" onClick={() => setOpen(true)}>
        ☰
      </button>

      {open && (
        <div className="lfm-drawerRoot" role="dialog" aria-modal="true">
          <div className="lfm-backdrop" onClick={() => setOpen(false)} />

          <aside className="lfm-drawer">
            <div className="lfm-drawerTop">
              <div className="lfm-drawerBrand">
                <div className="lfm-drawerLogo">🌿</div>
                <div>
                  <div className="lfm-drawerTitle">LFM Agro</div>
                  <div className="lfm-drawerSub">Menu</div>
                </div>
              </div>

              <button className="lfm-closeBtn" aria-label="Fechar menu" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <nav className="lfm-nav">
              {items.map((it) => {
                if (!it.children) {
                  return (
                    <a key={it.label} className="lfm-navItem" href={it.href || "#"} onClick={() => setOpen(false)}>
                      <span>{it.label}</span>
                      <span>→</span>
                    </a>
                  );
                }

                const isOpen = expanded === it.label;

                return (
                  <div key={it.label}>
                    <button className="lfm-navItem lfm-navToggle" onClick={() => toggleGroup(it.label)}>
                      <span>{it.label}</span>
                      <span>{isOpen ? "▴" : "▾"}</span>
                    </button>

                    {isOpen && (
                      <div className="lfm-subMenu">
                        {it.children.map((c) => (
                          <a key={c.href} className="lfm-subItem" href={c.href} onClick={() => setOpen(false)}>
                            {c.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="lfm-ctaBox">
              <a className="lfm-ctaBtn" href="/produtor" onClick={() => setOpen(false)}>
                Portal do Produtor
              </a>

              <div className="lfm-social" aria-label="Redes sociais (placeholder)">
                <a className="lfm-socialBtn" href="#" onClick={(e) => e.preventDefault()}>
                  ⌁
                </a>
                <a className="lfm-socialBtn" href="#" onClick={(e) => e.preventDefault()}>
                  ▶
                </a>
                <a className="lfm-socialBtn" href="#" onClick={(e) => e.preventDefault()}>
                  f
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
