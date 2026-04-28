import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "jobtracker.sh",
  description:
    "A devtool-style tracker for software engineering graduate applications",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          try {
            const t = localStorage.getItem('theme') || 'dark';
            document.documentElement.dataset.theme = t;
          } catch(e) {}
        `,
          }}
        />
      </head>
      <body
  className={`${inter.variable} ${mono.variable} overflow-x-hidden`}
  suppressHydrationWarning
>
  {children}
</body>
    </html>
  );
}
