---
name: reports-generator
description: Use when generating PDF reports, CSV exports, or data exports for pump test results. Includes integration with pdfjs-dist, jspdf, and charting libraries for test documentation.
triggers:
  - reporte
  - report
  - PDF
  - exportar
  - export
  - csv
  - download
  - protocolo
  - generación de informes
role: specialist
scope: implementation
output-format: code
---

# Reports Generator Expert

Specialist in generating reports for pump testing: PDF documents, CSV exports, and data visualization with charts. Works with the project's data structures and export patterns.

## When to Use This Skill

- Generating pre-test reports with theoretical pump data
- Creating post-test reports with complete results
- Implementing CSV/Excel exports of test data
- Building live dashboards for in-test monitoring
- Adding charts and graphs to PDF reports
- Implementing historical report browsing

## Project Context

### Report Types

| Type | Content | Format |
|------|---------|--------|
| **Pre-test** | Theoretical pump data from PDF specs | PDF |
| **In-test** | Real-time data dashboard | Live view |
| **Post-test** | Complete results + graphs | PDF + CSV |
| **Historical** | Previous tests browsing | Table + charts |

### Current Stack

- **PDF Generation**: pdfjs-dist (render), custom layout
- **Charts**: Recharts (in-app), html2canvas for PDF
- **Export**: CSV via native JS
- **Location**: `apps/supervisor/src/lib/` for report utilities

## Core Workflow

1. **Identify report type** - Pre, In, Post, or Historical
2. **Gather data** - Fetch from API or use provided test context
3. **Generate PDF/CSV** - Use appropriate method
4. **Add charts** - Generate visualizations if needed
5. **Provide download** - Trigger browser download

## Common Patterns

### PDF Report Generation
```tsx
import { generatePDF } from '@/lib/pdfGenerator'
import { testDataToPDFLayout } from '@/lib/pdfLayouts'

const handleGenerateReport = async (testId: string) => {
  const data = await fetchTestData(testId)
  const layout = testDataToPDFLayout(data)
  const pdf = await generatePDF(layout)
  downloadPDF(pdf, `test-report-${testId}.pdf`)
}
```

### CSV Export
```tsx
const exportToCSV = (data: TestReading[], filename: string) => {
  const headers = ['timestamp', 'temperature', 'pressure', 'flow', 'rpm']
  const rows = data.map(d => headers.map(h => d[h]).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
```

### Chart for Report
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

const TestChart = ({ data }) => (
  <LineChart data={data}>
    <XAxis dataKey="timestamp" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="pressure" stroke="#2563eb" />
    <Line type="monotone" dataKey="flow" stroke="#16a34a" />
  </LineChart>
)
```

### Capture Chart for PDF
```tsx
import html2canvas from 'html2canvas'

const captureChartForPDF = async (chartRef: HTMLElement) => {
  const canvas = await html2canvas(chartRef)
  return canvas.toDataURL('image/png')
}
```

## Data Structures

```typescript
interface TestReport {
  id: string
  testDate: Date
  pump: {
    model: string
    serialNumber: string
    specifications: PumpSpecs
  }
  readings: TestReading[]
  results: TestResults
  charts: ChartData[]
}

interface TestReading {
  timestamp: number
  temperature: number
  pressure: number
  flow: number
  rpm: number
  power?: number
}
```

## Constraints

### MUST DO
- Use existing pdf utilities in `apps/supervisor/src/lib/`
- Follow naming convention: `test-report-{id}.pdf`
- Include test metadata (date, operator, pump info)
- Handle large datasets (chunk or lazy load)

### MUST NOT DO
- Don't generate PDFs client-side if server generation is available
- Don't include sensitive data in exports
- Don't skip error handling for large reports
- Don't forget to clean up blob URLs
