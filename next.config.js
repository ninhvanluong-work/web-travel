const { withSentryConfig } = require('@sentry/nextjs');
// eslint-disable-next-line import/no-extraneous-dependencies
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');
const withReactSvg = require('next-react-svg')({
  include: path.resolve(__dirname, 'src/assets/svg'),
  titleProp: false,
});
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // reactStrictMode: true,
  swcMinify: true,
  i18n,
  images: {
    domains: [],
    // Only hosts that actually serve our images (checked against the DB on 2026-11-11); a wildcard
    // turns /_next/image into an open proxy. Add a host here when a new image source is introduced.
    remotePatterns: [
      { protocol: 'https', hostname: '*.b-cdn.net' }, // Bunny CDN: uploads + video thumbnails
      { protocol: 'https', hostname: 'player.mediadelivery.net' }, // Bunny Stream thumbnails
      { protocol: 'https', hostname: 'images.unsplash.com' }, // placeholders in code
      { protocol: 'https', hostname: 'api.dicebear.com' }, // seeded tour guide avatars
    ],
    // unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 1800,
  },
  webpack(config, { isServer }) {
    // audio support
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // wallet connect warning
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    return config;
  },
};

const KEYS_TO_OMIT = [
  'webpackDevMiddleware',
  'configOrigin',
  'target',
  'analyticsId',
  'webpack5',
  'amp',
  'assetPrefix',
];

const makeConfig = (_phase, { defaultConfig }) => {
  const plugins = [
    [withBundleAnalyzer, {}],
    [withReactSvg, {}],
  ];

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  });

  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });

  return finalConfig;
};

module.exports = withSentryConfig(makeConfig, {
  silent: true,
  org: 'longtranvan',
  project: 'web-travel',
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
