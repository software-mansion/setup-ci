// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Native CI CLI',
  favicon: 'img/favicon.ico',

  url: 'https://docs.swmansion.com',

  baseUrl: '/react-native-ci-cli/',

  organizationName: 'software-mansion',
  projectName: 'react-native-ci-cli',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-image.png',
      metadata: [
        { name: 'og:image:width', content: '1200' },
        { name: 'og:image:height', content: '630' },
      ],
      navbar: {
        hideOnScroll: true,
        logo: {
          alt: 'React Native CI CLI logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        items: [
          {
            to: 'docs/introduction',
            activeBasePath: 'docs',
            label: 'Docs',
            position: 'right',
          },
          {
            href: 'https://github.com/software-mansion-labs/react-native-ci-cli/',
            position: 'right',
            className: 'header-github',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [],
        copyright:
          'All trademarks and copyrights belong to their respective owners.',
      },
    }),
}

module.exports = config
