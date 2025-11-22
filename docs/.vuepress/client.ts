import { defineClientConfig } from '@vuepress/client'

export default defineClientConfig({
  enhance({ _app, router, _siteData }) {
    if (typeof window !== 'undefined') {
      // Use router to update years when page changes
      router.afterEach(() => {
        setTimeout(() => {
          const currentYear = new Date().getFullYear()
          const yearElements = document.querySelectorAll('.dynamic-year')
          yearElements.forEach(element => {
            element.textContent = currentYear.toString()
          })
        }, 100)
      })
    }
  },
})
