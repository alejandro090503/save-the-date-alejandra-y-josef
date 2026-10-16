import type { Metadata } from "next";
import { Cormorant_Garamond, Parisienne, Dancing_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-ampersand",
  display: "swap",
});



export const metadata: Metadata = {
  title: "Save the Date · Alejandra & Josef — 17 Julio 2027",
  description: "Reserva la fecha: Alejandra & Josef se casan el 17 de julio de 2027 en la Ciudad de México.",
  openGraph: {
    title: "Save the Date · Alejandra & Josef — 17 Julio 2027",
    description: "Reserva la fecha: 17 de julio de 2027 · Ciudad de México.",
    siteName: "Save the Date Alejandra & Josef",
    locale: "es_MX",
    type: "website",
    images: [{ url: "https://save-the-date-alejandra-y-josef.vercel.app/og-image.jpg?v=4", width: 1200, height: 630, alt: "Save the Date Alejandra & Josef" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Save the Date · Alejandra & Josef — 17 Julio 2027",
    description: "Reserva la fecha: 17 de julio de 2027 · Ciudad de México.",
    images: ["https://save-the-date-alejandra-y-josef.vercel.app/og-image.jpg?v=4"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${parisienne.variable} ${dancingScript.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
