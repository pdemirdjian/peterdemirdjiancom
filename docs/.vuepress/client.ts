import { defineClientConfig } from '@vuepress/client'
import DownloadPDF from './components/DownloadPDF.vue'

export default defineClientConfig({
  enhance({ app, router, siteData: _siteData }) {
    // Register global component
    app.component('DownloadPDF', DownloadPDF)
    
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
