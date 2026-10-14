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
        className={`flor-btn ${playing ? "is-playing" : ""}`}
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/flor-play.png" alt="" />
        <span className="flor-icon" aria-hidden="true">
          {playing ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          )}
        </span>
      </button>
    </>
  );
});

export default AudioPlayer;
