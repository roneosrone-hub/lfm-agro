import styles from "./page.module.css";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>🌿</div>
            <div className={styles.brandText}>
              <div className={styles.brandName}>LFM Agro</div>
              <div className={styles.brandTag}>Plataforma agrícola inteligente</div>
            </div>
          </div>

          <nav className={styles.nav}>
            <a className={styles.navLink} href="#recursos">Recursos</a>
            <a className={styles.navLink} href="#acesso">Acessos</a>
            <a className={styles.navLink} href="#sobre">Sobre</a>
          </nav>

          <div className={styles.headerCtas}>
            <Link className={styles.headerBtnGhost} href="/produtor">
              Entrar
            </Link>
            <a className={styles.headerBtn} href="#acesso">
              Começar agora
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div className={styles.pill}>AgTech • Monitoramento • Mapa</div>
              <h1 className={styles.h1}>
                Decisão no campo com <span className={styles.h1Accent}>mapa, gride e histórico</span>.
              </h1>
              <p className={styles.p}>
                Um app direto ao ponto para <strong>Produtor</strong> e <strong>Técnico</strong>: desenhe talhões,
                gere grides, registre pontos e visualize status (verde/amarelo/vermelho) no mapa.
              </p>

              <div className={styles.heroActions}>
                <a className={styles.primary} href="#acesso">Acessar agora</a>
                <Link className={styles.secondary} href="/produtor/mapa">Abrir Mapa</Link>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <div className={styles.statTop}>✔</div>
                  <div className={styles.statText}>Gride automático</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statTop}>📍</div>
                  <div className={styles.statText}>Pontos GPS/manual</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statTop}>🗺️</div>
                  <div className={styles.statText}>Mapa + Satélite</div>
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.mock}>
                <div className={styles.mockTop}>
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.mockTitle}>Painel do Monitoramento</div>
                </div>

                <div className={styles.mockBody}>
                  <div className={styles.mockCard}>
                    <div className={styles.mockLabel}>Talhão</div>
                    <div className={styles.mockValue}>Selecione / desenhe no mapa</div>
                  </div>

                  <div className={styles.mockRow}>
                    <div className={styles.badgeGreen}>✅ Verde: tranquilo</div>
                    <div className={styles.badgeYellow}>⚠️ Amarelo: alerta</div>
                    <div className={styles.badgeRed}>🛑 Vermelho: crítico</div>
                  </div>

                  <div className={styles.mockHint}>
                    Dica: desenhe o talhão → gere o gride → registre praga/doença por ponto.
                  </div>

                  <div className={styles.mockButtons}>
                    <div className={styles.mockBtnPrimary}>Gerar gride</div>
                    <div className={styles.mockBtnGhost}>Exportar</div>
                  </div>
                </div>
              </div>

              <div className={styles.note}>
                Interface pensada para uso no campo: limpa, rápida e com leitura fácil.
              </div>
            </div>
          </div>
        </section>

        <section id="acesso" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.h2}>Escolha seu acesso</h2>
            <p className={styles.p2}>Dois caminhos, mesma plataforma. Visual profissional e foco em produtividade.</p>
          </div>

          <div className={styles.cards}>
            <Link href="/produtor" className={styles.card}>
              <div className={styles.cardIcon}>👨‍🌾</div>
              <div className={styles.cardTitle}>Produtor</div>
              <div className={styles.cardDesc}>
                Visual simples e objetivo: mapa, talhão, gride e acompanhamento rápido por cores.
              </div>
              <div className={styles.cardCta}>Entrar como Produtor →</div>
            </Link>

            <Link href="/tecnico" className={styles.card}>
              <div className={styles.cardIcon}>🧑‍🔬</div>
              <div className={styles.cardTitle}>Técnico</div>
              <div className={styles.cardDesc}>
                Registro completo: histórico, diagnóstico, PDF e fluxo técnico organizado.
              </div>
              <div className={styles.cardCta}>Entrar como Técnico →</div>
            </Link>
          </div>
        </section>

        <section id="recursos" className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.h2}>Recursos principais</h2>
            <p className={styles.p2}>O essencial para monitorar e decidir com segurança.</p>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🧱</div>
              <div className={styles.featureTitle}>Talhão por desenho</div>
              <div className={styles.featureDesc}>Marque a área no mapa e mantenha salvo no histórico.</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔲</div>
              <div className={styles.featureTitle}>Gride automático</div>
              <div className={styles.featureDesc}>Gera pontos/linhas para amostragem com espaçamento definido.</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎯</div>
              <div className={styles.featureTitle}>Status por cor</div>
              <div className={styles.featureDesc}>Verde / amarelo / vermelho direto no mapa por intensidade.</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📡</div>
              <div className={styles.featureTitle}>Mapa e Satélite</div>
              <div className={styles.featureDesc}>Alternância rápida para leitura de campo e referência.</div>
            </div>
          </div>
        </section>

        <section id="sobre" className={styles.footer}>
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerBrand}>LFM Agro</div>
              <div className={styles.footerText}>Plataforma agrícola inteligente • MVP em evolução</div>
            </div>
            <div className={styles.footerLinks}>
              <a className={styles.footerLink} href="#acesso">Acessos</a>
              <a className={styles.footerLink} href="#recursos">Recursos</a>
              <a className={styles.footerLink} href="#">Topo</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
