"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import AudioPlayer, { AudioAPI } from "./AudioPlayer";
import { LangCtx, type Lang } from "./i18n";

/* Loader de entrada: aves del paraíso y flores amarillas (moodboard del cliente) que
   florecen desde las esquinas + pradera abajo, nombres completos en Parisienne,
   fecha, y elección de idioma (el toque desbloquea la música y abre el telón). */
export function Loader({ children }: { children: React.ReactNode }) {
  const audio = useRef<AudioAPI>(null);
  const [lang, setLang] = useState<Lang>("es");
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("std-lang");
      if (saved === "en" || saved === "es") setLang(saved);
      else if (navigator.language?.toLowerCase().startsWith("en")) setLang("en");
    } catch {}
    document.documentElement.style.overflow = "hidden";
    let loaded = document.readyState === "complete";
    let timeUp = false;
    const check = () => { if (loaded && timeUp) setReady(true); };
    const onLoad = () => { loaded = true; check(); };
    window.addEventListener("load", onLoad);
    const t = setTimeout(() => { timeUp = true; check(); }, 2600);
    const failsafe = setTimeout(() => setReady(true), 6500);
    return () => { window.removeEventListener("load", onLoad); clearTimeout(t); clearTimeout(failsafe); };
  }, []);

  const choose = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("std-lang", l); } catch {}
    document.documentElement.lang = l;
  };

  const enter = (l: Lang) => {
    if (!ready || opening) return;
    choose(l);
    audio.current?.play();
    setOpening(true);
    setTimeout(() => {
      setGone(true);
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
    }, 1500);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang: choose }}>
      <AudioPlayer ref={audio} />
      {children}
      {gone && <LangToggle />}
      {!gone && (
        <div className={`ld ${ready ? "is-ready" : ""} ${opening ? "is-opening" : ""}`}>
          <div className="ld-half ld-top">
            <div className="ld-band ld-band-top" />
            <div className="bird-pair bird-pair--top ld-birds">
              <img src="/floral/bop-a.webp?v=2" alt="" className="bird bird-1" />
              <img src="/floral/bop-b.webp?v=2" alt="" className="bird bird-2" />
            </div>
          </div>
          <div className="ld-half ld-bottom">
            <div className="ld-band ld-band-bottom" />
            <div className="bird-pair bird-pair--bottom ld-birds">
              <img src="/floral/bop-a.webp?v=2" alt="" className="bird bird-1" />
              <img src="/floral/bop-b.webp?v=2" alt="" className="bird bird-2" />
            </div>
          </div>
          <div className="ld-sparkles" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <i key={i} style={{ left: `${(i * 53) % 92 + 4}%`, top: `${(i * 31) % 84 + 8}%`, animationDelay: `${(i % 7) * 0.45}s` }} />
            ))}
          </div>
          <div className="ld-aura" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="ld-center">
            <p className="ld-eyebrow">Save the Date</p>
            <h1 className="ld-names">
              <span className="ld-n1">Alejandra</span>
              <em>&amp;</em>
              <span className="ld-n2">Josef</span>
            </h1>
            <p className="ld-date">17 · 07 · 2027</p>
            <div className="ld-bar"><i /></div>
            <div className="ld-lang">
              <button type="button" onClick={() => enter("es")}>
                <span className="ld-tap-dot" />Español
              </button>
              <span className="ld-lang-sep" />
              <button type="button" onClick={() => enter("en")}>
                English<span className="ld-tap-dot" />
              </button>
            </div>
            <p className="ld-tap">Toca tu idioma · Tap your language</p>
          </div>
        </div>
      )}
    </LangCtx.Provider>
  );
}

function LangToggle() {
  return (
    <LangCtx.Consumer>
      {({ lang, setLang }) => (
        <button
          type="button"
          className="lang-toggle"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
        >
          <span className={lang === "es" ? "on" : ""}>ES</span>
          <i />
          <span className={lang === "en" ? "on" : ""}>EN</span>
        </button>
      )}
    </LangCtx.Consumer>
  );
}
