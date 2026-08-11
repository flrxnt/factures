<script setup lang="ts">
import { ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import SettingsSection from '../ui/SettingsSection.vue'
import SettingsSidebar from './SettingsSidebar.vue'
import type { SettingsTab } from './SettingsSidebar.vue'
import ThemePicker from './ThemePicker.vue'
import InvoiceDefaultsForm from './InvoiceDefaultsForm.vue'
import SmtpSettingsForm from './SmtpSettingsForm.vue'
import PaymentSettingsForm from './PaymentSettingsForm.vue'

const isTauriEnv = isTauri()
const activeTab = ref<SettingsTab>('apparence')

const SECTION_META: Record<SettingsTab, { title: string; description: string }> = {
  apparence: { title: 'Apparence', description: "Choisissez comment l'application s'affiche." },
  facturation: { title: 'Facturation', description: 'Valeurs par défaut appliquées à chaque nouvelle facture.' },
  email: { title: 'E-mail / SMTP', description: 'Configurez votre compte SMTP pour envoyer vos factures directement à vos clients depuis l’application.' },
  paiements: { title: 'Paiements', description: 'Générez des liens de paiement pour vos factures via Stripe ou PayDunya.' },
}
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
    <SettingsSidebar v-model="activeTab" :show-email="isTauriEnv" :show-paiements="isTauriEnv" />

    <div class="min-w-0 flex-1">
      <SettingsSection :title="SECTION_META[activeTab].title" :description="SECTION_META[activeTab].description">
        <ThemePicker v-if="activeTab === 'apparence'" />
        <InvoiceDefaultsForm v-else-if="activeTab === 'facturation'" />
        <SmtpSettingsForm v-else-if="activeTab === 'email' && isTauriEnv" />
        <PaymentSettingsForm v-else-if="activeTab === 'paiements' && isTauriEnv" />
      </SettingsSection>
    </div>
  </div>
</template>
