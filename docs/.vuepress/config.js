import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  bundler: viteBundler(),
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
        text: 'License',
        link: 'license.html'
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
    repo: 'pdemirdjian/peterdemirdjiancom',
    editLink: false
  }),
})
