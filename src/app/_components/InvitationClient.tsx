"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "./i18n";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";

/* Paleta del cliente (moodboard del taller floral): fucsia #D41F7F, rosa #F08CA0,
   naranja #EE4E22, amarillo #F8B91A, oliva #7F8B4E. Roles conservados del template;
   los tonos de TEXTO se oscurecen para contraste >=4.5:1 en crema. */
const C = {
  black: "#0D0D0D",
  white: "#FFFFFF",
  wine: "#B0175F",        // fucsia profundo — acento principal
  wineDeep: "#8C1149",
  gold: "#C2410C",        // naranja quemado — íconos/ornamentos
  goldLight: "#EE4E22",   // naranja vivo — SOLO decorativo
  sage: "#5F6B33",        // oliva profundo
  sageLight: "#7F8B4E",
  olive: "#9A6700",       // amarillo/mostaza profundo
  oliveLight: "#F8B91A",  // amarillo vivo — SOLO decorativo
  mauve: "#5F6B33",       // olivo (antes rosa)
  mauveLight: "#C9A227",  // dorado (antes rosa claro)
  charcoal: "#2C2C2C",
  gray: "#5F5F5F",
  softGray: "#6B6B6B",
  cream: "#FAF8F5",
  border: "#EBDCD3",
};

/* ─── Countdown ─── */
function Countdown() {
  const t = useT();
  const target = new Date("2027-07-17T12:30:00-06:00").getTime();
  const [now, setNow] = useState(target);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const units = [
    { val: days, label: t.cd[0] },
    { val: hours, label: t.cd[1] },
    { val: mins, label: t.cd[2] },
    { val: secs, label: t.cd[3] },
  ];

  return (
    <div className="flex items-center justify-center">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center">
          <div className="flex flex-col items-center" style={{ minWidth: 58 }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 28,
                color: C.black,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(u.val).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: 14,
                fontWeight: 600,
                color: C.gray,
                letterSpacing: "0.06em",
                marginTop: 8,
              }}
            >
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <div
              style={{
                width: 1,
                height: 24,
                backgroundColor: C.gold,
                opacity: 0.3,
                marginLeft: 4,
                marginRight: 4,
              }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Ornament ─── (hairline + gema en el color protagonista de cada sección) */
function Ornament({ width = 100, tone = C.gold }: { width?: number; tone?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div style={{ height: 1.5, width: width / 2, backgroundColor: tone, opacity: 0.55 }} />
      <svg width="13" height="13" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill={tone} />
      </svg>
      <div style={{ height: 1.5, width: width / 2, backgroundColor: tone, opacity: 0.55 }} />
    </div>
  );
}

/* ─── Section Divider entre secciones ─── */
function Divider({ tone = C.mauve }: { tone?: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        backgroundColor: "transparent",
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      <div style={{ height: 1.5, width: 56, backgroundColor: tone, opacity: 0.5 }} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-3">
        <circle cx="12" cy="12" r="1.6" fill={tone} />
        <circle cx="12" cy="12" r="5.5" stroke={tone} strokeWidth="0.75" opacity="0.55" />
      </svg>
      <div style={{ height: 1.5, width: 56, backgroundColor: tone, opacity: 0.5 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SISTEMA DE MOVIMIENTO — reveals escalonados con resorte físico
   + rieles florales con parallax de scroll. Respeta prefers-reduced-motion.
   ═══════════════════════════════════════════════════════ */
const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};
const revealItem: Variants = {
  hidden: { opacity: 0, y: 38, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 88, damping: 15, mass: 0.9 } },
};

/* Contenedor: dispara el stagger de sus RevealItem hijos al entrar en viewport */
function Reveal({ children, className, style, ...rest }: { children: React.ReactNode; className?: string; style?: React.CSSProperties } & Record<string, unknown>) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style} {...rest}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      variants={revealParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* Hijo individual dentro de un Reveal — hereda el stagger del padre */
function RevealItem({ children, style, ...rest }: { children: React.ReactNode; style?: React.CSSProperties } & Record<string, unknown>) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style} {...rest}>{children}</div>;
  return (
    <motion.div variants={revealItem} style={style} {...rest}>
      {children}
    </motion.div>
  );
}

/* Riel floral vertical (acuarela) a un costado — deriva y rota sutilmente con el scroll,
   nunca cubre el centro donde vive el contenido. */
function FloralSide({
  src,
  side,
  width = 150,
  opacity = 0.9,
  drift = 46,
}: {
  src: string;
  side: "left" | "right";
  width?: number;
  opacity?: number;
  drift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  const rotate = useTransform(scrollYProgress, [0, 1], side === "left" ? [-2.2, 2.2] : [2.2, -2.2]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: side === "left" ? 0 : undefined,
        right: side === "right" ? 0 : undefined,
        width: `clamp(64px, 20vw, ${width}px)`,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {reduce ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity }} />
      ) : (
        <motion.img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity, y, rotate }} />
      )}
    </div>
  );
}

/* Banda floral horizontal — crece desde el borde inferior de una sección, con leve parallax. */
function FloralBand({ src, height = 230, opacity = 0.95 }: { src: string; height?: number; opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [26, -14]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: `clamp(150px, 26vw, ${height}px)`,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {reduce ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom", opacity }} />
      ) : (
        <motion.img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom", opacity, y, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)" }} />
      )}
    </div>
  );
}

function SectionBg({ src, opacity = 0.55, parallax = false, drift = 40 }: { src: string; opacity?: number; parallax?: boolean; drift?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: parallax ? `-${drift}px 0` : "0",
    pointerEvents: "none",
    zIndex: 0,
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity,
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
    maskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
  };

  if (!parallax || reduce) {
    return <div ref={ref} aria-hidden="true" style={{ ...baseStyle, inset: 0 }} />;
  }

  return (
    <motion.div ref={ref} aria-hidden="true" style={{ ...baseStyle, y }} />
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */
function Hero() {
  const reduce = useReducedMotion();
  const t = useT();
  return (
    <section
      className="flex flex-col items-center text-center"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: "transparent",
        justifyContent: "center",
        paddingTop: "clamp(130px, 18vh, 190px)",
        paddingBottom: "clamp(170px, 24vh, 240px)",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <WindFlowers src="/floral/hero-top.webp" edge="top" />
      <BirdPair edge="top" />
      <WindFlowers src="/floral/hero-bottom.webp" edge="bottom" />
      <BirdPair edge="bottom" />
      <Petals />

      <motion.div
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: C.wine,
          margin: "0 0 clamp(18px, 4vw, 28px)",
          paddingLeft: "0.42em",
        }}
      >
        {t.std}
      </p>

      {/* Nombres apilados */}
      <h1
        style={{
          fontFamily: "var(--font-script)",
          fontWeight: 400,
          fontSize: "clamp(4.2rem, 19vw, 8rem)",
          letterSpacing: "0",
          color: C.wineDeep,
          lineHeight: 1.05,
          textShadow: "0 2px 18px rgba(250,248,245,.9)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Alejandra
      </h1>

      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-heading)",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: "clamp(2.4rem, 10vw, 4rem)",
          color: C.gold,
          lineHeight: 0.9,
          margin: "clamp(-8px, -1vw, 0px) 0",
        }}
      >
        &amp;
      </p>

      <h1
        style={{
          fontFamily: "var(--font-script)",
          fontWeight: 400,
          fontSize: "clamp(4.2rem, 19vw, 8rem)",
          letterSpacing: "0",
          color: C.wineDeep,
          lineHeight: 1.05,
          textShadow: "0 2px 18px rgba(250,248,245,.9)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Josef
      </h1>

      {/* Texto de invitación */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: "clamp(13px, 3.6vw, 15px)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.charcoal,
          lineHeight: 1.9,
          textAlign: "center",
          maxWidth: 280,
          marginTop: "clamp(20px, 4vw, 32px)",
          marginBottom: 0,
        }}
      >
        {t.reserve1}
        <br />
        {t.reserve2}
      </p>

      {/* Fecha grande */}
      <div style={{ marginTop: "clamp(16px, 3.5vw, 26px)", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(2rem, 9.5vw, 5rem)",
            letterSpacing: "0.06em",
            color: C.black,
            lineHeight: 1,
            margin: 0,
          }}
        >
          {t.month}
        </p>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(2rem, 9.5vw, 5rem)",
            letterSpacing: "0.06em",
            color: C.black,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          2027
        </p>
      </div>

      {/* Línea vertical */}
      <div
        aria-hidden="true"
        style={{
          width: 1,
          height: "clamp(36px, 6vw, 52px)",
          backgroundColor: C.black,
          opacity: 0.25,
          margin: "clamp(20px, 4vw, 32px) auto 0",
        }}
      />

      {/* Lugar + countdown */}
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(24px, 7vw, 34px)",
          letterSpacing: "0.04em",
          color: C.wineDeep,
          textAlign: "center",
          marginTop: "clamp(14px, 2.5vw, 20px)",
          marginBottom: "clamp(16px, 3vw, 24px)",
        }}
      >
        {t.city}
      </p>

      <Countdown />
      </motion.div>

    </section>
  );
}

/* ─── Section base wrapper (puro HTML) ─── */
function Section({
  id,
  children,
  bg = C.cream,
  style: styleProp,
}: {
  id?: string;
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      className="text-center"
      style={{
        backgroundColor: bg === C.cream ? "transparent" : bg,
        paddingTop: 88,
        paddingBottom: 88,
        paddingLeft: 24,
        paddingRight: 24,
        ...styleProp,
      }}
    >
      {children}
    </section>
  );
}

/* ─── Eyebrow + title group ─── */
function SectionTitle({ eyebrow, title, tone }: { eyebrow?: string; title: string; tone?: string }) {
  return (
    <>
      {eyebrow && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.wine,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(2rem, 9vw, 3.6rem)",
          letterSpacing: "0.05em",
          color: C.black,
          lineHeight: 1.05,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {title}
      </h2>
      <div style={{ marginBottom: 36 }}>
        <Ornament width={100} tone={tone} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   FRASE — cita romántica destacada
   ═══════════════════════════════════════════════════════ */
function Frase() {
  const t = useT();
  return (
    <Section style={{ paddingTop: 88, paddingBottom: 88, position: "relative", overflow: "hidden" }}>
      <SectionBg src="/floral/bg-frase.webp" opacity={0.5} parallax drift={50} />

      {/* Dissolve inferior */}

      <Reveal style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
        <RevealItem>
          <Ornament width={70} tone={C.wine} />
        </RevealItem>
        <RevealItem style={{ margin: "28px 0" }}>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 6vw, 2.3rem)",
              color: C.wine,
              lineHeight: 1.5,
              textAlign: "center",
              margin: 0,
            }}
          >
            &ldquo;{t.quote1}
            <br />
            {t.quote2}&rdquo;
          </p>
        </RevealItem>
        <RevealItem>
          <Ornament width={70} tone={C.wine} />
        </RevealItem>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   MENSAJE
   ═══════════════════════════════════════════════════════ */
function Mensaje() {
  const t = useT();
  return (
    <Section style={{ paddingBottom: 20 }}>
      <Reveal style={{ maxWidth: 460, margin: "0 auto" }}>
        <RevealItem>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(1.15rem, 4.4vw, 1.35rem)",
              color: C.charcoal,
              lineHeight: 1.9,
              textAlign: "center",
            }}
          >
            {t.msg}
          </p>
        </RevealItem>
        <RevealItem style={{ marginTop: 18 }}>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.05rem, 4vw, 1.25rem)",
              color: C.wine,
              lineHeight: 1.9,
              textAlign: "center",
              margin: 0,
            }}
          >
            {t.wait}
          </p>
        </RevealItem>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   PHOTO DIVIDER — Foto entre secciones (sustituye al divider ornamental)
   ═══════════════════════════════════════════════════════ */
function PhotoDivider({ src, aspect = "16 / 10", tone = C.gold, delay = 0 }: { src: string; aspect?: string; tone?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
  };
  return (
    <div aria-hidden="true" style={{ padding: "56px 28px", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
      <motion.figure
        initial={reduce ? undefined : { opacity: 0, y: 50, scale: 0.92 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
        style={{ margin: 0, width: "100%", maxWidth: 360, perspective: 900 }}
      >
        <div className="photo-float" style={{ animationDelay: `${delay}s` }}>
          <div
            onPointerMove={onMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              position: "relative",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform .35s cubic-bezier(.22,1,.36,1)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* halo de color que respira detrás */}
            <div className="photo-halo" style={{ background: `radial-gradient(circle at 30% 30%, ${C.mauveLight}, transparent 60%), radial-gradient(circle at 75% 70%, ${C.oliveLight}, transparent 55%), radial-gradient(circle at 70% 20%, ${C.goldLight}, transparent 50%)` }} />
            <div style={{ position: "relative", padding: 10, background: "#fffdf9", borderRadius: 6, boxShadow: "0 18px 40px -12px rgba(140,17,73,.35), 0 4px 14px rgba(13,13,13,.08)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: aspect, overflow: "hidden", borderRadius: 3, outline: `1.5px solid ${tone}`, outlineOffset: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="photo-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="photo-sheen" />
              </div>
            </div>
          </div>
        </div>
      </motion.figure>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  const t = useT();
  return (
    <section
      className="text-center"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
        padding: "76px 24px clamp(150px, 34vw, 260px)",
      }}
    >
      <BirdPair edge="bottom" />
      <WindFlowers src="/floral/bg-footer.webp" edge="bottom" height="clamp(170px, 38vw, 300px)" opacity={0.75} inView />

      <div style={{ position: "relative", zIndex: 1 }}>
      <Reveal>
        {/* Ornamento floral dorado */}
        <RevealItem>
          <div className="photo-float" style={{ width: "min(240px, 62vw)", margin: "0 auto 34px", position: "relative" }}>
            <div className="arch-ring" />
            <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "999px 999px 14px 14px", overflow: "hidden", border: "6px solid #fffdf9", boxShadow: "0 20px 44px -14px rgba(140,17,73,.45)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotos/beso-arbol.webp" alt="Alejandra y Josef" loading="lazy" className="photo-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" }} />
              <div className="photo-sheen" />
            </div>
          </div>
        </RevealItem>

        <RevealItem>
          <svg viewBox="0 0 260 44" fill="none" aria-hidden="true" style={{ display: "block", margin: "0 auto 26px", width: "min(230px, 62vw)", height: "auto" }}>
            <g stroke={C.gold} strokeWidth="0.9" fill="none" opacity="0.85">
              <path d="M18 22 Q60 8 100 22 Q118 32 130 22 Q142 12 160 22 Q200 36 242 22" />
              <circle cx="130" cy="22" r="3.4" fill={C.gold} stroke="none" />
              <path d="M127 15 Q130 10 133 15" opacity="0.7" />
              <path d="M127 29 Q130 34 133 29" opacity="0.7" />
            </g>
          </svg>
        </RevealItem>

        <RevealItem>
          <p
            style={{
              fontFamily: "var(--font-script)",
              color: C.wineDeep,
              fontSize: "clamp(2.6rem, 10vw, 4.4rem)",
              lineHeight: 1.05,
              textAlign: "center",
            }}
          >
            Alejandra <span style={{ color: C.gold }}>&amp;</span> Josef
          </p>
        </RevealItem>

        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            margin: "22px auto 24px",
          }}
        >
          <div style={{ height: 1, width: 40, background: `linear-gradient(to right, transparent, ${C.gold})` }} />
          <svg width="9" height="9" viewBox="0 0 10 10" fill={C.gold} aria-hidden="true">
            <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" />
          </svg>
          <div style={{ height: 1, width: 40, background: `linear-gradient(to left, transparent, ${C.gold})` }} />
        </div>

        <RevealItem>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.charcoal,
              textAlign: "center",
            }}
          >
            {t.footerDate}
          </p>

          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 15,
              color: C.gray,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {t.city}
          </p>

          <a
            href="https://www.instagram.com/elysium.invitaciones/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginTop: 26,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.softGray,
              textDecoration: "none",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
            @elysium.invitaciones
          </a>
        </RevealItem>
      </Reveal>
      </div>
    </section>
  );
}

/* Calendario julio 2027 con el 17 marcado */
function Calendario() {
  const t = useT();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const lead = 4; // 1 jul 2027 = jueves (L M M J V S D)
  return (
    <Section style={{ position: "relative", overflow: "hidden", paddingTop: 64, paddingBottom: "clamp(170px, 34vw, 230px)" }}>
      <BirdPair edge="bottom" />
      <WindFlowers src="/floral/cal-band.webp" edge="bottom" height="clamp(170px, 34vw, 230px)" opacity={0.9} inView />
      <Reveal style={{ position: "relative", zIndex: 1, maxWidth: 340, margin: "0 auto" }}>
        <RevealItem>
          <SectionTitle eyebrow={t.calEyebrow} title={t.calTitle} tone={C.gold} />
        </RevealItem>
        <RevealItem>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontFamily: "var(--font-body)" }}>
            {t.week.map((d, i) => (
              <span key={"h" + i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: C.wine, paddingBottom: 6 }}>{d}</span>
            ))}
            {Array.from({ length: lead - 1 }).map((_, i) => <span key={"e" + i} />)}
            {days.map((d) => (
              <span
                key={d}
                style={{
                  position: "relative",
                  fontSize: 16,
                  fontWeight: d === 17 ? 700 : 500,
                  color: d === 17 ? C.white : C.charcoal,
                  lineHeight: "36px",
                  height: 36,
                  display: "block",
                }}
              >
                {d === 17 && (
                  <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0 }}>
                    <svg className="heart-beat" viewBox="0 0 24 24" style={{ width: 44, height: 44, overflow: "visible" }}>
                      <path d="M12 21.6C6.4 16.1 1 11.3 1 7.2 1 3.4 4.1 2 6.3 2c1.3 0 4.2.5 5.7 4.5C13.6 2.5 16.5 2 17.7 2 20.3 2 23 3.6 23 7.2c0 4.1-5.1 8.6-11 14.4z" fill={C.wine} transform="translate(0 1.2)" />
                    </svg>
                    <span className="heart-ring" />
                  </span>
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{d}</span>
              </span>
            ))}
          </div>
        </RevealItem>
        <RevealItem style={{ marginTop: 34 }}>
          <div className="photo-float" style={{ animationDelay: "0.8s", width: "min(220px, 58vw)", margin: "0 auto", position: "relative" }}>
            <div className="ring-photo-glow" />
            <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 999, overflow: "hidden", border: "5px solid #fffdf9", boxShadow: "0 18px 40px -14px rgba(140,17,73,.45)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotos/anillo.webp" alt="" loading="lazy" className="photo-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%", display: "block" }} />
              <div className="photo-sheen" />
            </div>
          </div>
        </RevealItem>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — Save the Date
   ═══════════════════════════════════════════════════════ */
export function InvitationClient() {
  return (
    <main style={{ backgroundColor: C.cream, width: "100%", position: "relative", isolation: "isolate" }}>
      <AuraBg />
      <Hero />
      <PhotoDivider src="/fotos/nueva-arbol.webp" aspect="4 / 5" tone={C.wine} />
      <Frase />
      <Calendario />
      <PhotoDivider src="/fotos/foto4.webp" aspect="4 / 5" tone={C.gold} delay={1.4} />
      <Mensaje />
      <Divider tone={C.mauve} />
      <Footer />
    </main>
  );
}

/* Fondo vivo: esferas difuminadas de la paleta que derivan lentamente (fijo detrás de todo) */
function AuraBg() {
  const blobs = [
    { c: "#E2A11B", s: 62, x: "-12%", y: "4%", d: 22 },
    { c: "#F8B91A", s: 48, x: "62%", y: "18%", d: 26 },
    { c: "#D41F7F", s: 44, x: "8%", y: "58%", d: 30 },
    { c: "#EE4E22", s: 40, x: "70%", y: "70%", d: 24 },
    { c: "#A3AD72", s: 46, x: "30%", y: "34%", d: 34 },
  ];
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
      {blobs.map((b, i) => (
        <span
          key={i}
          className="aura-blob"
          style={{
            left: b.x,
            top: b.y,
            width: `${b.s}vmax`,
            height: `${b.s}vmax`,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
            animationDuration: `${b.d}s`,
            animationDelay: `${-i * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Flores del hero mecidas por el viento: la banda se divide en 3 rebanadas con bordes
   difuminados; cada una se mece desde su base (arriba cuelgan, abajo crecen) con
   tiempos distintos → movimiento orgánico. Entran "creciendo" y tienen parallax. */
function WindFlowers({ src, edge, height, opacity = 1, inView = false }: { src: string; edge: "top" | "bottom"; height?: string; opacity?: number; inView?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: inView ? ["start end", "end start"] : ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], inView ? [24, -12] : edge === "top" ? [0, -60] : [0, 50]);
  const vFade = edge === "top"
    ? "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)"
    : "linear-gradient(to top, transparent 0%, black 26%, black 58%, transparent 100%)";
  const slices = [
    { h: "linear-gradient(to right, black 0%, black 30%, transparent 46%)", d: 7.5, delay: 0 },
    { h: "linear-gradient(to right, transparent 24%, black 40%, black 60%, transparent 76%)", d: 9, delay: -2.5 },
    { h: "linear-gradient(to right, transparent 54%, black 70%, black 100%)", d: 8.2, delay: -5 },
  ];
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      initial={reduce ? undefined : { opacity: 0, scaleY: 0.55 }}
      animate={reduce || inView ? undefined : { opacity, scaleY: 1 }}
      whileInView={reduce || !inView ? undefined : { opacity, scaleY: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: inView ? 0.1 : edge === "top" ? 0.15 : 0.45 }}
      style={{
        position: "absolute",
        left: "-4%",
        right: "-4%",
        [edge]: 0,
        height: height ?? (edge === "top" ? "clamp(170px, 26vh, 300px)" : "clamp(200px, 30vh, 320px)"),
        transformOrigin: edge === "top" ? "top center" : "bottom center",
        pointerEvents: "none",
        zIndex: 0,
        y: reduce ? 0 : y,
      }}
    >
      {slices.map((sl, i) => (
        <div
          key={i}
          className={reduce ? undefined : `wind-sway wind-${edge}`}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: edge === "top" ? "center top" : "center bottom",
            mixBlendMode: "multiply",
            animationDuration: `${sl.d}s`,
            animationDelay: `${sl.delay}s`,
            WebkitMaskImage: `${sl.h}, ${vFade}`,
            maskImage: `${sl.h}, ${vFade}`,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      ))}
    </motion.div>
  );
}

/* Pétalos que caen suavemente en el hero */
function Petals() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const colors = ["#F8B91A", "#D41F7F", "#E2A11B", "#C2410C", "#7F8B4E"];
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            width: 8 + (i % 3) * 3,
            height: 11 + (i % 3) * 4,
            animationDuration: `${11 + (i % 5) * 2.3}s`,
            animationDelay: `${-i * 1.7}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Par de aves del paraíso juntas como acento del follaje (mismo acento en todas las bandas) */
function BirdPair({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden="true"
      className={`bird-pair bird-pair--${edge}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/floral/bop-a.webp?v=2" alt="" className="bird bird-1" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/floral/bop-b.webp?v=2" alt="" className="bird bird-2" />
    </div>
  );
}
