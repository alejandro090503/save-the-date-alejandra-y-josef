"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

export interface AudioAPI {
  play: () => void;
}

const AudioPlayer = forwardRef<AudioAPI>(function AudioPlayer(_props, ref) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hint, setHint] = useState(false);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setHint(true), 2200);
    const b = setTimeout(() => setHint(false), 9000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      const a = audioRef.current;
      if (!a) return;
      setVisible(true);
      a.volume = 0.55;
      a.play().catch(() => {});
    },
  }));

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    setVisible(true);
    setTouched(true);
    setHint(false);
    if (a.paused) {
      a.volume = 0.55;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  return (
    <>
      {/* Audio — servido desde Supabase (fuera de Vercel), preload="none" para no disparar egress */}
      <audio
        ref={audioRef}
        src="https://bsjoelxktbvlavfoozhk.supabase.co/storage/v1/object/public/fotos-clientes/audio/boda-alejandra-y-josef/cancion.mp3"
        preload="none"
        loop
      />
      <div className={`music-dock ${playing ? "is-playing" : ""} ${touched ? "is-touched" : ""}`}>
        <span className={`music-hint ${hint && !playing ? "show" : ""}`} aria-hidden="true">
          <em>Nuestra canción</em>
          <small>toca para escuchar</small>
        </span>
        <button
          onClick={toggle}
          aria-label={playing ? "Pausar música" : "Reproducir música"}
          className="music-btn"
          type="button"
        >
          <span className="music-wave" aria-hidden="true" />
          <span className="music-wave w2" aria-hidden="true" />
          <span className="music-ring" aria-hidden="true" />
          <span className="music-glass" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="music-flor" src="/flor-play.png" alt="" />
            <span className="music-veil" />
            <span className="music-icon">
              {playing ? (
                <span className="eq"><i /><i /><i /><i /></span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M8.5 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.3 0-1.7l-10-6.4c-.7-.5-1.6 0-1.6.8z" fill="#fff" /></svg>
              )}
            </span>
          </span>
        </button>
      </div>
    </>
  );
});

export default AudioPlayer;
