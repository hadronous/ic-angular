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
  categoryOrder: ['API', 'Types', '*'],
  sort: ['source-order'],
  navigation: {
    includeCategories: true,
    includeGroups: false,
  },
  searchCategoryBoosts: {
    API: 1.5,
  },
};

const config: Config = {
  title: 'IC Angular',
  tagline: 'Angular support for Internet Computer applications',
  url: 'https://hadronous.github.io',
  baseUrl: '/ic-angular',
  organizationName: 'hadronous',
  projectName: 'ic-angular',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
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
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
        id: 'ic-angular',
        out: 'ic-angular',
        entryPoints: ['../packages/ic-angular/src/public-api.ts'],
        tsconfig: '../packages/ic-angular/tsconfig.json',
        readme: '../packages/ic-angular/README.md',
        sidebar: {
          categoryLabel: 'ic-angular',
        },
        ...commonTypeDocOptions,
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'ic-build-angular',
        out: 'ic-build-angular',
        entryPoints: [
          '../packages/ic-build-angular/src/canister-plugin.ts',
          '../packages/ic-build-angular/src/application/index.ts',
          '../packages/ic-build-angular/src/dev-server/index.ts',
        ],
        tsconfig: '../packages/ic-build-angular/tsconfig.json',
        readme: '../packages/ic-build-angular/README.md',
        sidebar: {
          categoryLabel: 'ic-build-angular',
        },
        ...commonTypeDocOptions,
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
