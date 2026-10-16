"use client";

import { createContext, useContext } from "react";

export type Lang = "es" | "en";

export const T = {
  es: {
    std: "Save the Date",
    reserve1: "Reserva la fecha para",
    reserve2: "nuestra boda",
    month: "JULIO 17",
    city: "Ciudad de México",
    cd: ["Días", "Horas", "Min", "Seg"],
    quote1: "Y así, sin buscarnos,",
    quote2: "nos encontramos para siempre",
    calEyebrow: "Sábado",
    calTitle: "JULIO 2027",
    week: ["L", "M", "M", "J", "V", "S", "D"],
    msg: "Estamos muy felices de compartirte que nos casamos. Aparta este día en tu calendario; muy pronto recibirás la invitación formal con todos los detalles",
    wait: "¡Te esperamos!",
    footerDate: "17 · Julio · 2027",
    tap: "Toca para abrir",
    song: "Nuestra canción",
    songTap: "toca para escuchar",
  },
  en: {
    std: "Save the Date",
    reserve1: "Please save the date for",
    reserve2: "our wedding",
    month: "JULY 17",
    city: "Mexico City",
    cd: ["Days", "Hours", "Min", "Sec"],
    quote1: "And so, without searching,",
    quote2: "we found each other forever",
    calEyebrow: "Saturday",
    calTitle: "JULY 2027",
    week: ["M", "T", "W", "T", "F", "S", "S"],
    msg: "We are so happy to share that we are getting married. Mark this day on your calendar; the formal invitation with all the details will follow soon",
    wait: "We can't wait to celebrate with you!",
    footerDate: "July · 17 · 2027",
    tap: "Tap to open",
    song: "Our song",
    songTap: "tap to listen",
  },
} as const;

export const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "es", setLang: () => {} });
export const useT = () => T[useContext(LangCtx).lang];
export const useLang = () => useContext(LangCtx);
