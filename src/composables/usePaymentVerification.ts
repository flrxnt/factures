import type { Invoice } from '../types/invoice'
import { useAppSettings } from './useAppSettings'
import { useAppDialog } from './useAppDialog'
import { useInvoiceCollection } from './useInvoiceCollection'
import { checkStripePaymentStatus, checkPayDunyaPaymentStatus, checkPayPalPaymentStatus } from '../lib/paymentProviders'

export function usePaymentVerification() {
  const { settings } = useAppSettings()
  const { alert } = useAppDialog()
  const { setStatus } = useInvoiceCollection()

  async function verifyPayment(invoice: Invoice): Promise<void> {
    if (!invoice.paymentProvider || !invoice.paymentReference) {
      await alert("Aucun lien de paiement généré via un fournisseur n'est associé à cette facture.", {
        title: 'Vérification impossible',
      })
      return
    }

    try {
      const paid =
        invoice.paymentProvider === 'stripe'
          ? await checkStripePaymentStatus(invoice.paymentReference)
          : invoice.paymentProvider === 'paydunya'
            ? await checkPayDunyaPaymentStatus(
                { masterKey: settings.payments.paydunya.masterKey, publicKey: settings.payments.paydunya.publicKey },
                invoice.paymentReference,
              )
            : await checkPayPalPaymentStatus(
                { clientId: settings.payments.paypal.clientId, mode: settings.payments.paypal.mode },
                invoice.paymentReference,
              )

      if (paid) {
        if (invoice.status !== 'paid') setStatus(invoice.id, 'paid')
        await alert('Le paiement a bien été reçu — la facture est marquée comme payée.', { title: 'Paiement confirmé' })
      } else {
        await alert("Le paiement n'a pas encore été effectué.", { title: 'En attente de paiement' })
      }
    } catch (error) {
      await alert(`Impossible de vérifier le paiement : ${error}`, { title: 'Erreur' })
    }
  }

  return { verifyPayment }
}
