"use client";

import React, { useMemo, useState } from "react";
import styles from "./mapa.module.css";
import ProdutorMapa from "../produtor-mapa";

type Base = "mapa" | "satelite";

export default function Page() {
  const [base, setBase] = useState<Base>("mapa");
  const [status, setStatus] = useState<string>("Pronto para desenhar o talhão.");
  const [lastGeoJSON, setLastGeoJSON] = useState<any>(null);

  // Ponte: vamos ouvir eventos via window (simples e robusto no mobile)
  useMemo(() => {
    if (typeof window === "undefined") return;

    const onCreated = (e: any) => {
      setLastGeoJSON(e?.detail ?? null);
      setStatus("Talhão desenhado! Agora você pode gerar a grade.");
    };

    const onCenter = () => setStatus("Centralizado no seu local.");
    const onCleared = () => setStatus("Camadas limpas.");

    window.addEventListener("agros:drawCreated", onCreated as any);
    window.addEventListener("agros:centerMe", onCenter as any);
    window.addEventListener("agros:cleared", onCleared as any);

    return () => {
      window.removeEventListener("agros:drawCreated", onCreated as any);
      window.removeEventListener("agros:centerMe", onCenter as any);
      window.removeEventListener("agros:cleared", onCleared as any);
    };
  }, []);

  function setBaseLayer(next: Base) {
    setBase(next);
    window.dispatchEvent(new CustomEvent("agros:setBase", { detail: next }));
  }

  function centerMe() {
    window.dispatchEvent(new CustomEvent("agros:centerMe"));
  }

  function startDraw() {
    window.dispatchEvent(new CustomEvent("agros:startDraw"));
    setStatus("Modo desenho ativado. Toque no mapa para marcar os pontos.");
  }

  function clearAll() {
    window.dispatchEvent(new CustomEvent("agros:clearAll"));
    setStatus("Limpando…");
  }

  function gerarGrade() {
    if (!lastGeoJSON) {
      setStatus("Desenhe um talhão primeiro.");
      return;
    }
    // aqui depois você liga com turf + grid real
    setStatus("Grade: em breve (próximo passo). Talhão já está salvo.");
    alert("✅ Talhão capturado! Próximo passo: gerar grid real por tamanho (ex: 1ha/2ha).");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>🌿</div>
          <div className={styles.brandTxt}>
            <div className={styles.title}>LFM Agro</div>
            <div className={styles.sub}>Mapa do Produtor</div>
          </div>
        </div>

        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${base === "mapa" ? styles.chipOn : ""}`}
            onClick={() => setBaseLayer("mapa")}
            type="button"
          >
            🗺️ Mapa
          </button>
          <button
            className={`${styles.chip} ${base === "satelite" ? styles.chipOn : ""}`}
            onClick={() => setBaseLayer("satelite")}
            type="button"
          >
            🛰️ Satélite
          </button>
          <button className={styles.chip} onClick={centerMe} type="button">
            📍 Meu local
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.mapWrap}>
          <ProdutorMapa />
        </div>

        <div className={styles.bottom}>
          <div className={styles.statusRow}>
            <span className={styles.dot} />
            <span className={styles.status}>{status}</span>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startDraw} type="button">
              ✍️ Desenhar talhão
            </button>

            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={gerarGrade} type="button">
              🔳 Gerar grade
            </button>

            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={clearAll} type="button">
              🧹 Limpar
            </button>
          </div>

          <div className={styles.hint}>
            Dica: use <b>Satélite</b> para pegar melhor as bordas do talhão.
          </div>
        </div>
      </main>
    </div>
  );
}
