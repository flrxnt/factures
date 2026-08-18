import type { RevenueReport, UnpaidInvoiceRow, MarginReport, ReportPeriod } from './reports'
import { REPORT_PERIOD_ORDER } from './reports'
import { saveFile } from './saveFile'

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface ReportExportData {
  period: ReportPeriod
  revenue: RevenueReport
  unpaid: UnpaidInvoiceRow[]
  margin: MarginReport
  expensesTotal: number
}

/** One spreadsheet-friendly file: a summary block followed by the unpaid-
 * invoices detail — the two figures an accountant actually needs to act on,
 * rather than a full re-dump of every report table shown on screen. */
export async function exportReportAsCsv(data: ReportExportData): Promise<void> {
  const periodLabel = REPORT_PERIOD_ORDER.find((p) => p.value === data.period)?.labelFr ?? data.period
  const lines: string[] = []

  lines.push(['Rapport', periodLabel].map(csvCell).join(','))
  lines.push('')
  lines.push(['Indicateur', 'Valeur'].map(csvCell).join(','))
  lines.push(['CA (HT)', String(data.revenue.revenueHt)].map(csvCell).join(','))
  lines.push(['TVA collectée', String(data.revenue.vatCollected)].map(csvCell).join(','))
  lines.push(['Encaissé', String(data.revenue.collected)].map(csvCell).join(','))
  lines.push(['Impayés', String(data.revenue.unpaid)].map(csvCell).join(','))
  lines.push(['Marge brute', String(data.margin.margin)].map(csvCell).join(','))
  lines.push(['Dépenses', String(data.expensesTotal)].map(csvCell).join(','))
  lines.push('')

  lines.push(['Factures impayées'].map(csvCell).join(','))
  lines.push(['Facture', 'Client', 'Date', 'Solde dû'].map(csvCell).join(','))
  for (const row of data.unpaid) {
    lines.push([row.name, row.clientName, row.issueDate, String(row.balance)].map(csvCell).join(','))
  }

  // Leading BOM so Excel (Windows) reliably detects UTF-8 and renders accents correctly.
  const content = '﻿' + lines.join('\n')
  await saveFile(content, `rapport-${todayStamp()}.csv`, 'text/csv;charset=utf-8')
}
