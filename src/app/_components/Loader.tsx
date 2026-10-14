"use client";

import { useEffect, useRef, useState } from "react";
import AudioPlayer, { AudioAPI } from "./AudioPlayer";

/* Loader de entrada: flores que crecen desde arriba y abajo, monograma en Great Vibes
   que se revela con un trazo de luz, fecha y línea de progreso. Al terminar invita a
   tocar (gesto = desbloquea la música) y se abre como telón hacia arriba y abajo. */
export function Loader({ children }: { children: React.ReactNode }) {
  const audio = useRef<AudioAPI>(null);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
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

  const enter = () => {
    if (!ready || opening) return;
    audio.current?.play();
    setOpening(true);
    setTimeout(() => {
      setGone(true);
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
    }, 1500);
  };

  return (
    <>
      <AudioPlayer ref={audio} />
      {children}
      {!gone && (
        <div
          className={`ld ${ready ? "is-ready" : ""} ${opening ? "is-opening" : ""}`}
          onClick={enter}
          role="button"
          tabIndex={0}
          aria-label="Toca para abrir el Save the Date"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && enter()}
        >
          <div className="ld-half ld-top">
            <div className="ld-flowers ld-flowers-top" />
          </div>
          <div className="ld-half ld-bottom">
            <div className="ld-flowers ld-flowers-bottom" />
          </div>
          <div className="ld-aura" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="ld-center">
            <p className="ld-eyebrow">Save the Date</p>
            <p className="ld-mono">
              <span>A</span>
              <em>&amp;</em>
              <span>J</span>
            </p>
            <p className="ld-date">17 · 07 · 2027</p>
            <div className="ld-bar"><i /></div>
            <p className="ld-tap">
              <span className="ld-tap-dot" />
              Toca para abrir
            </p>
          </div>
        </div>
      )}
    </>
  );
}
