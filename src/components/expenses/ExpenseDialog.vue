<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePaymentCollection } from '../../composables/usePaymentCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import { PAYMENT_METHOD_PRESETS, EXPENSE_CATEGORY_PRESETS } from '../../config/finance'
import BaseInput from '../ui/BaseInput.vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { save, create } = usePaymentCollection()
const { alert } = useAppDialog()

const amount = ref(0)
const category = ref('')
const counterparty = ref('')
const method = ref('')
const paidAt = ref(new Date().toISOString().slice(0, 10))
const note = ref('')
const saving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    amount.value = 0
    category.value = ''
    counterparty.value = ''
    method.value = ''
    paidAt.value = new Date().toISOString().slice(0, 10)
    note.value = ''
  },
)

function close() {
  emit('update:open', false)
}

async function handleSave() {
  if (amount.value <= 0) return
  saving.value = true
  try {
    const expense = create('out', null)
    expense.amount = amount.value
    expense.category = category.value
    expense.counterparty = counterparty.value
    expense.method = method.value
    expense.paidAt = paidAt.value
    expense.note = note.value
    await save(expense)
    close()
  } catch (error) {
    await alert(`Impossible d'enregistrer la dépense : ${error}`, { title: 'Erreur' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" @click.self="close">
      <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <p class="font-display text-lg text-ink">Nouvelle dépense</p>

        <div class="mt-4 space-y-4">
          <BaseInput v-model.number="amount" type="number" label="Montant" />
          <div class="grid grid-cols-2 gap-4">
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Catégorie</span>
              <input
                v-model="category"
                list="expense-category-options"
                class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent"
              />
              <datalist id="expense-category-options">
                <option v-for="c in EXPENSE_CATEGORY_PRESETS" :key="c" :value="c" />
              </datalist>
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Moyen</span>
              <input
                v-model="method"
                list="expense-method-options"
                class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent"
              />
              <datalist id="expense-method-options">
                <option v-for="m in PAYMENT_METHOD_PRESETS" :key="m" :value="m" />
              </datalist>
            </label>
          </div>
          <BaseInput v-model="counterparty" label="Bénéficiaire" />
          <BaseInput v-model="paidAt" type="date" label="Date" />
          <BaseTextarea v-model="note" label="Note" :rows="2" />
        </div>

        <div class="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            class="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-hairline-strong transition hover:bg-paper-dim"
            :disabled="saving"
            @click="close"
          >
            Annuler
          </button>
          <BaseButton variant="primary" :disabled="saving || amount <= 0" @click="handleSave">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
