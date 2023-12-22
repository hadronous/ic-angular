import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const commonTypeDocOptions = {
  includeVersion: true,
  searchInComments: true,
  cleanOutputDir: true,
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  excludeExternals: true,
  categorizeByGroup: false,
  sourceLinkExternal: true,
  mergeReadme: true,
  watch: process.env.TYPEDOC_WATCH,
  sort: ['source-order'],
};

const config: Config = {
  title: 'IC Angular',
  tagline: 'Angular support for Internet Computer applications',
  url: 'https://hadronous.github.io',
  baseUrl: '/ic-angular',
  organizationName: 'hadronous',
  projectName: 'ic-angular',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        ...commonTypeDocOptions,
        id: 'ic-angular',
        out: 'docs/ic-angular',
        entryPoints: ['../packages/ic-angular/src/public-api.ts'],
        tsconfig: '../packages/ic-angular/tsconfig.json',
        readme: '../packages/ic-angular/README.md',
        sidebar: {
          indexLabel: 'ic-angular',
          pretty: true,
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        ...commonTypeDocOptions,
        id: 'ic-build-angular',
        out: 'docs/ic-build-angular',
        entryPoints: [
          '../packages/ic-build-angular/src/canister-plugin.ts',
          '../packages/ic-build-angular/src/application/index.ts',
          '../packages/ic-build-angular/src/dev-server/index.ts',
        ],
        tsconfig: '../packages/ic-build-angular/tsconfig.json',
        readme: '../packages/ic-build-angular/README.md',
        sidebar: {
          indexLabel: 'ic-build-angular',
          pretty: true,
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'IC Angular',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Docs',
        },
        {
          href: 'https://github.com/hadronous/ic-angular',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Hadronous Labs.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
