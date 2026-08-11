<script setup lang="ts">
import { isTauri } from '@tauri-apps/api/core'
import SettingsSection from '../ui/SettingsSection.vue'
import ThemePicker from './ThemePicker.vue'
import InvoiceDefaultsForm from './InvoiceDefaultsForm.vue'
import SmtpSettingsForm from './SmtpSettingsForm.vue'

const isTauriEnv = isTauri()
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
    <SettingsSection title="Apparence" description="Choisissez comment l'application s'affiche.">
      <ThemePicker />
    </SettingsSection>

    <SettingsSection title="Facturation" description="Valeurs par défaut appliquées à chaque nouvelle facture.">
      <InvoiceDefaultsForm />
    </SettingsSection>

    <SettingsSection
      v-if="isTauriEnv"
      title="E-mail / SMTP"
      description="Configurez votre compte SMTP pour envoyer vos factures directement à vos clients depuis l'application."
    >
      <SmtpSettingsForm />
    </SettingsSection>
  </div>
</template>
