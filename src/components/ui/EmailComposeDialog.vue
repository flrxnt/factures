<script setup lang="ts">
import { useEmailCompose } from '../../composables/useEmailCompose'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import BaseButton from './BaseButton.vue'

const { composeState, canSend, cancelCompose, confirmSend } = useEmailCompose()
</script>

<template>
  <Teleport to="body">
    <div v-if="composeState.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" @click.self="cancelCompose">
      <div class="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl" role="dialog" aria-modal="true">
        <p class="font-display text-lg text-ink">Envoyer par e-mail</p>
        <div class="mt-4 space-y-4">
          <div>
            <BaseInput v-model="composeState.toEmail" type="email" label="Destinataire" placeholder="client@exemple.com" />
            <p v-if="composeState.toEmail && !canSend" class="mt-1 text-xs text-accent-dark">Adresse e-mail invalide.</p>
          </div>
          <BaseInput v-model="composeState.subject" label="Objet" />
          <BaseTextarea v-model="composeState.body" label="Message" :rows="8" />
        </div>
        <div class="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            class="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-hairline-strong transition hover:bg-paper-dim"
            :disabled="composeState.sending"
            @click="cancelCompose"
          >
            Annuler
          </button>
          <BaseButton variant="primary" :disabled="composeState.sending || !canSend" @click="confirmSend">
            {{ composeState.sending ? 'Envoi…' : 'Envoyer' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
