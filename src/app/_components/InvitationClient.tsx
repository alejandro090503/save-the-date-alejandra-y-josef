"use client";

import { useEffect, useRef, useState } from "react";
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
  mauve: "#C2456A",       // rosa profundo
  mauveLight: "#F08CA0",
  charcoal: "#2C2C2C",
  gray: "#5F5F5F",
  softGray: "#6B6B6B",
  cream: "#FAF8F5",
  border: "#EBDCD3",
};

/* ─── Countdown ─── */
function Countdown() {
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
    { val: days, label: "Días" },
    { val: hours, label: "Horas" },
    { val: mins, label: "Min" },
    { val: secs, label: "Seg" },
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
                fontSize: 10,
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
        backgroundColor: C.cream,
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
        <motion.img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom", opacity, y }} />
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
  return (
    <section
      className="flex flex-col items-center text-center"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: C.cream,
        justifyContent: "center",
        paddingTop: "clamp(56px, 10vh, 88px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <FloralSide src="/floral/rail-left-wild.webp" side="left" width={170} opacity={0.85} drift={30} />
      <FloralSide src="/floral/rail-right-wild.webp" side="right" width={170} opacity={0.85} drift={30} />

      <motion.div
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: C.wine,
          margin: "0 0 clamp(18px, 4vw, 28px)",
          paddingLeft: "0.42em",
        }}
      >
        Save the Date
      </p>

      {/* Nombres apilados */}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(2.8rem, 14vw, 7.5rem)",
          letterSpacing: "0.12em",
          color: C.black,
          lineHeight: 1,
          textAlign: "center",
          margin: 0,
        }}
      >
        ALEJANDRA
      </h1>

      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-ampersand)",
          fontWeight: 400,
          fontSize: "clamp(4rem, 16vw, 8rem)",
          color: C.wine,
          lineHeight: 0.9,
          margin: "clamp(-8px, -1vw, 0px) 0",
        }}
      >
        &amp;
      </p>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(2.8rem, 14vw, 7.5rem)",
          letterSpacing: "0.12em",
          color: C.black,
          lineHeight: 1,
          textAlign: "center",
          margin: 0,
        }}
      >
        JOSEF
      </h1>

      {/* Texto de invitación */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "clamp(9px, 2.2vw, 11px)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.charcoal,
          lineHeight: 1.9,
          textAlign: "center",
          maxWidth: 280,
          marginTop: "clamp(20px, 4vw, 32px)",
          marginBottom: 0,
        }}
      >
        Reserva la fecha para
        <br />
        nuestra boda
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
          JULIO 17
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
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(12px, 3vw, 15px)",
          color: C.gray,
          textAlign: "center",
          marginTop: "clamp(14px, 2.5vw, 20px)",
          marginBottom: "clamp(16px, 3vw, 24px)",
        }}
      >
        Ciudad de México
      </p>

      <Countdown />
      </motion.div>

      {/* Dissolve inferior — se estira hacia arriba */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to bottom, transparent, ${C.cream})`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
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
        backgroundColor: bg,
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
  return (
    <Section style={{ paddingTop: 88, paddingBottom: 88, position: "relative", overflow: "hidden" }}>
      <SectionBg src="/floral/bg-frase.webp" opacity={0.5} parallax drift={50} />

      {/* Dissolve superior */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: `linear-gradient(to bottom, ${C.cream}, transparent)`, zIndex: 1, pointerEvents: "none" }} />
      {/* Dissolve inferior */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: `linear-gradient(to top, ${C.cream}, transparent)`, zIndex: 1, pointerEvents: "none" }} />

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
            &ldquo;Y así, sin buscarnos,
            <br />
            nos encontramos para siempre&rdquo;
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
            Estamos muy felices de compartirte que nos casamos.
            Aparta este día en tu calendario; muy pronto recibirás la invitación formal
            con todos los detalles
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
            ¡Te esperamos!
          </p>
        </RevealItem>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   PHOTO DIVIDER — Foto entre secciones (sustituye al divider ornamental)
   ═══════════════════════════════════════════════════════ */
function PhotoDivider({ src, aspect = "16 / 10", tone = C.gold }: { src: string; aspect?: string; tone?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: C.cream,
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <figure
        style={{
          margin: 0,
          width: "100%",
          maxWidth: 380,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: aspect,
            overflow: "hidden",
            boxShadow: "0 2px 22px rgba(13,13,13,0.08)",
            border: `2px solid ${tone}`,
          }}
        >
          {/* Esquinas decorativas en el color de la sección siguiente */}
          <div style={{ position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: `2px solid ${C.white}`, borderLeft: `2px solid ${C.white}`, opacity: 0.9, zIndex: 2 }} />
          <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: `2px solid ${C.white}`, borderRight: `2px solid ${C.white}`, opacity: 0.9, zIndex: 2 }} />
          <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: `2px solid ${C.white}`, borderLeft: `2px solid ${C.white}`, opacity: 0.9, zIndex: 2 }} />
          <div style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: `2px solid ${C.white}`, borderRight: `2px solid ${C.white}`, opacity: 0.9, zIndex: 2 }} />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              filter: "saturate(0.9) contrast(1.02)",
            }}
          />
        </div>
      </figure>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <section
      className="text-center"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: C.cream,
        padding: "76px 24px clamp(150px, 34vw, 260px)",
      }}
    >
      {/* Borde floral inferior — pradera de flores silvestres */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "clamp(150px, 34vw, 300px)",
          backgroundImage: "url(/floral/bg-footer.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 55%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 55%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
      <Reveal>
        {/* Ornamento floral dorado */}
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
            17 · Julio · 2027
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
            Ciudad de México
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
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const lead = 4; // 1 jul 2027 = jueves (L M M J V S D)
  return (
    <Section style={{ position: "relative", overflow: "hidden", paddingTop: 64, paddingBottom: 64 }}>
      <FloralSide src="/floral/rail-left-meadow.webp" side="left" width={130} opacity={0.75} drift={36} />
      <FloralSide src="/floral/rail-right-meadow.webp" side="right" width={130} opacity={0.75} drift={36} />
      <Reveal style={{ position: "relative", zIndex: 1, maxWidth: 340, margin: "0 auto" }}>
        <RevealItem>
          <SectionTitle eyebrow="Sábado" title="JULIO 2027" tone={C.gold} />
        </RevealItem>
        <RevealItem>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontFamily: "var(--font-body)" }}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
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
                }}
              >
                {d === 17 && (
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ position: "absolute", inset: -4, width: "calc(100% + 8px)", height: 44, zIndex: -1 }}>
                    <path d="M12 21.6C6.4 16.1 1 11.3 1 7.2 1 3.4 4.1 2 6.3 2c1.3 0 4.2.5 5.7 4.5C13.6 2.5 16.5 2 17.7 2 20.3 2 23 3.6 23 7.2c0 4.1-5.1 8.6-11 14.4z" fill={C.wine} />
                  </svg>
                )}
                <span style={{ position: "relative" }}>{d}</span>
              </span>
            ))}
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
    <main style={{ backgroundColor: C.cream, width: "100%" }}>
      <Hero />
      <PhotoDivider src="/fotos/foto1.webp" aspect="4 / 5" tone={C.wine} />
      <Frase />
      <Calendario />
      <PhotoDivider src="/fotos/foto4.webp" aspect="4 / 5" tone={C.gold} />
      <Mensaje />
      <Divider tone={C.mauve} />
      <Footer />
    </main>
  );
}
