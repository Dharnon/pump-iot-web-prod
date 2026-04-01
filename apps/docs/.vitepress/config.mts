import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
    title: 'PumpIoT Documentation',
    description: 'Documentation for the PumpIoT ecosystem',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Architecture', link: '/architecture' },
            { text: 'Backend', link: '/backend' },
            { text: 'Database Mapping', link: '/database-mapping' },
            { text: 'Supervisor', link: '/supervisor' },
            { text: 'Operator', link: '/operator' },
            { text: 'Deployment', link: '/deployment' }
        ],
        sidebar: [
            {
                text: 'Getting Started',
                items: [
                    { text: 'Home', link: '/' },
                    { text: 'Architecture', link: '/architecture' },
                    { text: 'Backend API', link: '/backend' },
                    { text: 'Database Mapping', link: '/database-mapping' },
                    { text: 'Supervisor App', link: '/supervisor' },
                    { text: 'Operator App', link: '/operator' },
                    { text: 'Deployment', link: '/deployment' }
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/flowserve/pump-iot' }
        ]
    },
    mermaid: {
        // mermaid configuration
    }
}))
