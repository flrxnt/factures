import { computed, reactive } from 'vue'
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Exposed so EmailComposeDialog.vue can disable the Send button — the
// recipient may be typed in the dialog itself when the invoice has no
// client email on file, so this can't be checked only at openCompose() time.
const canSend = computed(() => EMAIL_PATTERN.test(composeState.toEmail.trim()))

// No blocking check here anymore — if the invoice has no client email, the
// dialog just opens with an empty "Destinataire" field for the user to fill
// in themselves, instead of refusing to open at all.
function openCompose(invoice: Invoice) {
  const { settings } = useAppSettings()
  const totals = computeInvoiceTotals(invoice)
  const tokens = {
    clientName: invoice.client.name,
    invoiceNumber: invoice.meta.invoiceNumber,
    total: formatCurrency(totals.netPayable, invoice.meta.currency, invoice.meta.locale),
    sellerName: invoice.seller.name,
    paymentLink: invoice.paymentLink,
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
  if (!invoice || !canSend.value) return

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
  return { composeState, canSend, openCompose, cancelCompose, confirmSend }
}
