import type { Invoice } from '../types/invoice'
import { computeInvoiceTotals } from './calculations'
import { getStatusDescriptor } from '../config/statuses'
import { UNTITLED_INVOICE_NAME } from '../config/defaults'

function downloadBlob(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Full-fidelity backup of every invoice — re-importable in principle (same
 * shape as what's stored), unlike the per-invoice PDF which is a rendered
 * document, not portable data. */
export function exportInvoicesAsJson(invoices: Invoice[]): void {
  const content = JSON.stringify({ exportedAt: new Date().toISOString(), invoices }, null, 2)
  downloadBlob(content, 'application/json', `factures-${todayStamp()}.json`)
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Spreadsheet-friendly summary (one row per invoice) for reporting/accounting
 * use — not the full line-item detail, which belongs in the per-invoice PDF. */
export function exportInvoicesAsCsv(invoices: Invoice[]): void {
  const header = ['Nom', 'Client', 'Statut', "Date d'émission", 'Devise', 'Total net'].map(csvCell).join(',')
  const rows = invoices.map((invoice) => {
    const totals = computeInvoiceTotals(invoice)
    return [
      invoice.name || UNTITLED_INVOICE_NAME,
      invoice.client.name,
      getStatusDescriptor(invoice.status).labelFr,
      invoice.meta.issueDate,
      invoice.meta.currency,
      String(totals.netPayable),
    ]
      .map(csvCell)
      .join(',')
  })
  // Leading BOM so Excel (Windows) reliably detects UTF-8 and renders accents correctly.
  const content = '﻿' + [header, ...rows].join('\n')
  downloadBlob(content, 'text/csv;charset=utf-8', `factures-${todayStamp()}.csv`)
}
