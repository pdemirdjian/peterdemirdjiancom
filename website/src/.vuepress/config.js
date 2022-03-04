const { link } = require('fs')
const { description } = require('../../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Peter Demirdjian',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: "Senior DevOps Engineer",

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],
  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    navbar: [
      {
        text: 'Resume',
        link: '/resume/resume.md',
      },
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/peter-demirdjian/',
      },
      {
        text: 'Github',
        link: 'https://github.com/pdemirdjian'
      },
      {
        text: 'Email',
        link: 'mailto:code@peterdemirdjian.com'
      }
    ],
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
