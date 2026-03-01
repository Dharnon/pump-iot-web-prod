import DefaultTheme from 'vitepress/theme'
import './custom.css'
import mermaid from 'mermaid'

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
        fontSize: '14px'
    }
})

// Client-side only rendering
if (typeof window !== 'undefined') {
    // Function to render mermaid diagrams
    const renderMermaid = async () => {
        // Find all pre elements that might contain mermaid code
        const preElements = document.querySelectorAll('pre')

        for (const pre of preElements) {
            const code = pre.querySelector('code')
            if (!code) continue

            const text = code.textContent || ''
            // Check if this is a mermaid code block
            if (text.includes('flowchart') || text.includes('graph') ||
                text.includes('stateDiagram') || text.includes('erDiagram') ||
                text.includes('sequenceDiagram') || text.includes('classDiagram')) {

                // Skip if already rendered
                if (pre.classList.contains('mermaid-rendered')) continue

                try {
                    pre.classList.add('mermaid-rendered')
                    const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)
                    const { svg } = await mermaid.render(id, text)

                    const div = document.createElement('div')
                    div.className = 'mermaid-diagram'
                    div.innerHTML = svg

                    pre.replaceWith(div)
                } catch (error) {
                    console.error('Mermaid render error:', error)
                }
            }
        }
    }

    // Wait for page to be fully loaded
    window.addEventListener('load', () => {
        setTimeout(renderMermaid, 500)
    })

    // Also try on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(renderMermaid, 500)
    })

    // Watch for Vue Router navigation
    let lastUrl = location.href
    new MutationObserver(() => {
        const url = location.href
        if (url !== lastUrl) {
            lastUrl = url
            setTimeout(renderMermaid, 500)
        }
    }).observe(document, { subtree: true, childList: true })
}

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        // app is the Vue app instance
    }
}
