import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

export default defineUserConfig({
  lang: 'en-US',
  title: 'Pete Demirdjian',
  description: 'Made by Pete Demirdjian with ❤️',
  head: [['link', { rel: 'icon', href: '/images/favicon.ico' }]],
  theme: defaultTheme({
    lastUpdated: false,
    contributors: false,
    logo: 'images/favicon.ico',
    navbar: [
      {
        text: 'Resume',
        link: 'resume.html'
      },
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/peter-demirdjian/'
      },
      {
        text: 'Email',
        link: 'mailto:code@peterdemirdjian.com'
      }
    ],
    repo: 'pdemirdjian/peterdemirdjiancom'
  }),
  plugins: [
    googleAnalyticsPlugin({
      id: 'G-8MJYD301PV',
    }),
  ],
})