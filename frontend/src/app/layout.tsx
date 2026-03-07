import type { Metadata } from "next";
import { Sora, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "MedScan - Your pathology reports, understood.",
  description: "AI-powered pathology report analysis platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('medscan-theme');
                if (storedTheme) {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                } else {
                  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                  document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans bg-bg-base text-text-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
