<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppSettings } from '../../composables/useAppSettings'
import { useAppDialog } from '../../composables/useAppDialog'
import { hasSmtpPassword, saveSmtpPassword, deleteSmtpPassword, testSmtpConnection } from '../../lib/sendEmail'
import { EMAIL_TEMPLATE_TOKENS } from '../../config/settingsDefaults'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const { settings } = useAppSettings()
const smtp = settings.smtp
const { alert } = useAppDialog()

const SECURITY_OPTIONS = [
  { value: 'ssl', label: 'SSL/TLS' },
  { value: 'starttls', label: 'STARTTLS' },
  { value: 'none', label: 'Aucune' },
]

const passwordDraft = ref('')
const hasSavedPassword = ref(false)
const savingPassword = ref(false)
const testing = ref(false)

onMounted(async () => {
  hasSavedPassword.value = await hasSmtpPassword(smtp)
})

async function handleSavePassword() {
  if (!passwordDraft.value) return
  savingPassword.value = true
  try {
    await saveSmtpPassword(smtp, passwordDraft.value)
    passwordDraft.value = ''
    hasSavedPassword.value = true
  } catch (error) {
    await alert(`Impossible d'enregistrer le mot de passe : ${error}`, { title: 'Erreur' })
  } finally {
    savingPassword.value = false
  }
}

async function handleDeletePassword() {
  try {
    await deleteSmtpPassword(smtp)
    hasSavedPassword.value = false
  } catch (error) {
    await alert(`Impossible de supprimer le mot de passe : ${error}`, { title: 'Erreur' })
  }
}

async function handleTestConnection() {
  testing.value = true
  try {
    await testSmtpConnection(smtp)
    await alert('Connexion réussie.', { title: 'Test SMTP' })
  } catch (error) {
    await alert(`Échec de la connexion : ${error}`, { title: 'Test SMTP' })
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <BaseToggle v-model="smtp.enabled" label="Activer l'envoi par e-mail" />

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="sm:col-span-2">
        <BaseInput v-model="smtp.host" label="Serveur SMTP" placeholder="smtp.example.com" />
      </div>
      <BaseInput v-model.number="smtp.port" type="number" label="Port" placeholder="587" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <BaseSelect v-model="smtp.security" label="Sécurité" :options="SECURITY_OPTIONS" />
      <BaseInput v-model="smtp.username" label="Nom d'utilisateur" />
    </div>

    <div class="space-y-2">
      <BaseInput v-model="passwordDraft" type="password" label="Mot de passe" placeholder="••••••••" />
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary" :disabled="!passwordDraft || savingPassword" @click="handleSavePassword">
          {{ savingPassword ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}
        </BaseButton>
        <button v-if="hasSavedPassword" type="button" class="text-xs font-medium text-muted hover:text-accent-dark" @click="handleDeletePassword">
          Supprimer
        </button>
        <p class="text-xs text-muted">
          {{ hasSavedPassword ? 'Mot de passe enregistré ✓' : 'Aucun mot de passe enregistré' }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <BaseInput v-model="smtp.fromName" label="Nom d'expéditeur" />
      <BaseInput v-model="smtp.fromEmail" type="email" label="E-mail d'expéditeur" />
    </div>

    <BaseTextarea v-model="smtp.emailSubjectTemplate" label="Objet de l'e-mail" />
    <BaseTextarea v-model="smtp.emailBodyTemplate" label="Corps de l'e-mail" :rows="6" />
    <p class="text-xs text-muted">
      Variables disponibles :
      <span v-for="(item, index) in EMAIL_TEMPLATE_TOKENS" :key="item.token">
        <code class="rounded bg-paper-dim px-1 py-0.5 text-ink-soft">{{ item.token }}</code>
        ({{ item.description }}){{ index < EMAIL_TEMPLATE_TOKENS.length - 1 ? ', ' : '' }}
      </span>
    </p>

    <BaseButton variant="secondary" :disabled="!smtp.host || !hasSavedPassword || testing" @click="handleTestConnection">
      {{ testing ? 'Test en cours…' : 'Tester la connexion' }}
    </BaseButton>
  </div>
</template>
