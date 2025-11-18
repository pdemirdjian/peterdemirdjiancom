<template>
  <div class="download-pdf-container">
    <a 
      href="/resume.pdf"
      download="Peter_Demirdjian_Resume.pdf"
      class="download-pdf-button" 
      aria-label="Download resume as PDF"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Download as PDF</span>
    </a>
  </div>
</template>

<style scoped>
.download-pdf-container {
  margin: 2rem 0;
  text-align: center;
}

.download-pdf-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-pdf-button:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.download-pdf-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-pdf-button svg {
  flex-shrink: 0;
}

@media print {
  .download-pdf-container {
    display: none !important;
  }
}
</style>
