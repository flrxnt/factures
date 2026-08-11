import { reactive } from 'vue'
import type { Invoice } from '../types/invoice'
import { useAppSettings } from './useAppSettings'
import { useAppDialog } from './useAppDialog'
import { computeInvoiceTotals } from '../lib/calculations'
import { formatCurrency } from './useCurrencyFormat'
import { renderEmailTemplate } from '../lib/emailTemplate'
import { sendInvoiceEmail } from '../lib/sendEmail'
import { generateInvoicePdf } from '../lib/pdf/generateInvoicePdf'
import { sanitizeFilename } from '../lib/filename'

interface ComposeState {
  visible: boolean
  invoice: Invoice | null
  toEmail: string
  subject: string
  body: string
  sending: boolean
}

// Module-level singleton, same pattern as useAppDialog — a single
// <EmailComposeDialog /> mounted once in App.vue renders this state.
const composeState = reactive<ComposeState>({
  visible: false,
  invoice: null,
  toEmail: '',
  subject: '',
  body: '',
  sending: false,
})

async function openCompose(invoice: Invoice) {
  const { alert } = useAppDialog()
  if (!invoice.client.email.trim()) {
    await alert("Cette facture n'a pas d'adresse e-mail client. Ajoutez-en une dans les informations du client.", {
      title: 'E-mail manquant',
    })
    return
  }

  const { settings } = useAppSettings()
  const totals = computeInvoiceTotals(invoice)
  const tokens = {
    clientName: invoice.client.name,
    invoiceNumber: invoice.meta.invoiceNumber,
    total: formatCurrency(totals.netPayable, invoice.meta.currency, invoice.meta.locale),
    sellerName: invoice.seller.name,
  }

  composeState.invoice = invoice
  composeState.toEmail = invoice.client.email
  composeState.subject = renderEmailTemplate(settings.smtp.emailSubjectTemplate, tokens)
  composeState.body = renderEmailTemplate(settings.smtp.emailBodyTemplate, tokens)
  composeState.visible = true
}

function cancelCompose() {
  composeState.visible = false
}

async function confirmSend() {
  const { settings } = useAppSettings()
  const { alert } = useAppDialog()
  const invoice = composeState.invoice
  if (!invoice) return

  composeState.sending = true
  try {
    const doc = generateInvoicePdf(invoice)
    const bytes = new Uint8Array(doc.output('arraybuffer'))
    const fallback = invoice.meta.invoiceNumber ? `facture-${invoice.meta.invoiceNumber}` : 'facture'
    const filename = `${sanitizeFilename(invoice.name, fallback)}.pdf`

    await sendInvoiceEmail({
      smtp: settings.smtp,
      toEmail: composeState.toEmail,
      subject: composeState.subject,
      body: composeState.body,
      pdfBytes: bytes,
      pdfFilename: filename,
    })
    composeState.visible = false
    await alert('E-mail envoyé avec succès.', { title: 'Envoyé' })
  } catch (error) {
    await alert(`Échec de l'envoi : ${error}`, { title: 'Erreur' })
  } finally {
    composeState.sending = false
  }
}

export function useEmailCompose() {
  return { composeState, openCompose, cancelCompose, confirmSend }
}
