import './globals.css';

export const metadata = {
  title: 'Ayush Saraf — Portfolio',
  description:
    'Final-year CS student at VIT and Oracle-certified Java developer. I build backend and full-stack applications in Python and Java, on strong DSA fundamentals.',
  applicationName: 'Ayush Saraf — Portfolio',
  authors: [{ name: 'Ayush Saraf' }],
  creator: 'Ayush Saraf',
  keywords: [
    'Ayush Saraf', 'Software Engineer', 'SDE', 'Backend Developer', 'Java Developer',
    'Python', 'DSA', 'Full-Stack', 'VIT Vellore', 'Portfolio',
  ],
  openGraph: {
    title: 'Ayush Saraf — Software Engineer',
    description:
      'I build backend and full-stack applications in Python and Java — on strong DSA fundamentals, with a bias toward code that ships.',
    siteName: 'Ayush Saraf — Portfolio',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayush Saraf — Software Engineer',
    description:
      'I build backend and full-stack applications in Python and Java — on strong DSA fundamentals, with a bias toward code that ships.',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: 'var(--bg)',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Fallback for users without JavaScript: reveal all animated-in content
            and drop the intro overlay so the page is fully readable. */}
        <noscript>
          <style>{`
            [data-reveal],[data-hero]{opacity:1!important;transform:none!important;filter:none!important}
            /* Both loaders are dismissed by JS — without it they would cover the
               page forever, so neither may render. */
            [data-intro],[data-simpleload]{display:none!important}
            body{cursor:auto!important}
            .custom-cursor-ring,.custom-cursor-dot{display:none!important}
          `}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
