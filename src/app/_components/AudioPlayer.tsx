"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

export interface AudioAPI {
  play: () => void;
}

const AudioPlayer = forwardRef<AudioAPI>(function AudioPlayer(_props, ref) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
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
      <button
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Reproducir música"}
        className={`vinyl-btn ${visible ? "is-ready" : ""} ${playing ? "is-playing" : ""}`}
        type="button"
      >
        <div className="vinyl-tonearm">
          <div className="vinyl-tonearm-pivot" />
          <div className="vinyl-tonearm-line" />
          <div className="vinyl-tonearm-head" />
        </div>
        <div className="vinyl-spin">
          <div className="vinyl-disc">
            <div className="vinyl-sheen" />
            <div className="vinyl-label-text">
              AJ<small>2027</small>
            </div>
            <div className="vinyl-hole" />
          </div>
        </div>
        <div className="vinyl-icons">
          <svg className="vinyl-icon-play" viewBox="0 0 24 24" fill="#FAF8F5" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg className="vinyl-icon-pause" viewBox="0 0 24 24" fill="#FAF8F5" aria-hidden="true">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        </div>
      </button>
    </>
  );
});

export default AudioPlayer;
