import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { sitemapPlugin } from '@vuepress/plugin-sitemap'

export default defineUserConfig({
  bundler: viteBundler(),
  lang: 'en-US',
  title: 'Pete Demirdjian',
  description: 'Made by Pete Demirdjian with ❤️',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/images/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Pete Demirdjian - Principal DevOps Engineer' }],
    ['meta', { property: 'og:description', content: 'Personal website and resume of Pete Demirdjian, Principal DevOps Engineer' }],
    ['meta', { property: 'og:url', content: 'https://peterdemirdjian.com' }],
    ['link', { rel: 'canonical', href: 'https://peterdemirdjian.com' }],
  ],
  theme: defaultTheme({
    lastUpdated: false,
    contributors: false,
    logo: 'images/favicon.ico',
    navbar: [
      {
        text: 'Resume',
        link: 'resume.html',
      },
      {
        text: 'License',
        link: 'license.html',
      },
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/peter-demirdjian/',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/pdemirdjian/peterdemirdjiancom',
      },
      {
        text: 'Email',
        link: 'mailto:code@peterdemirdjian.com',
      },
    ],
    editLink: false,
  }),
  plugins: [
    sitemapPlugin({
      hostname: 'https://peterdemirdjian.com',
      changefreq: 'monthly',
    }),
  ],
})
