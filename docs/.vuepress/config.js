import { defaultTheme } from '@vuepress/theme-default'

export default {
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
        link: 'resume.md'
      },
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/peter-demirdjian/'
      },
      {
        text: 'Github',
        link: 'https://github.com/pdemirdjian'
      },
      {
        text: 'Email',
        link: 'mailto:code@peterdemirdjian.com'
      }
    ]
  }),
}