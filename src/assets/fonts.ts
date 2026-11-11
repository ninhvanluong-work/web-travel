import FontLocal from 'next/font/local';

// Outfit is self-hosted (Google Fonts variable file, latin subset) so dev/build never depend on
// fonts.gstatic.com; a failed download used to fall back silently to Arial.
export const fontSans = FontLocal({
  src: '../../public/fonts/Outfit-Variable-latin.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-sans',
});

export const fontSerif = fontSans;
