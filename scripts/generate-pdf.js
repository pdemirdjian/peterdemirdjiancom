import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generatePDF() {
  console.log('🚀 Starting PDF generation...')
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    
    // Navigate to the built resume page
    const resumePath = join(__dirname, '../docs/.vuepress/dist/resume.html')
    await page.goto(`file://${resumePath}`, {
      waitUntil: 'networkidle0',
    })

    // Hide elements we don't want in the PDF
    await page.evaluate(() => {
      // Hide navigation and UI elements
      const elementsToHide = [
        '.navbar',
        '.sidebar',
        '.sidebar-mask',
        '.page-meta',
        '.page-nav',
        '.download-pdf-container',
        '#download-pdf-button',
        'nav',
        'aside',
        '.toggle-sidebar-button',
      ]
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          if (el) {
            el.style.display = 'none'
            el.remove() // Actually remove from DOM
          }
        })
      })

      // Reset page layout completely
      const themeContainer = document.querySelector('.theme-container')
      if (themeContainer) {
        themeContainer.style.paddingLeft = '0'
        themeContainer.style.margin = '0'
        themeContainer.style.padding = '0'
      }

      const page = document.querySelector('.page')
      if (page) {
        page.style.paddingLeft = '0'
        page.style.margin = '0'
        page.style.padding = '0'
        page.style.width = '100%'
      }

      const content = document.querySelector('.theme-default-content')
      if (content) {
        content.style.maxWidth = '100%'
        content.style.margin = '0'
        content.style.padding = '0'
      }
    })

    // Generate PDF with specific settings
    const outputPath = join(__dirname, '../docs/.vuepress/public/resume.pdf')
    
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: false,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    })

    console.log(`✅ PDF generated successfully: ${outputPath}`)
    console.log('📄 The PDF will be available at: /resume.pdf')
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

generatePDF()
