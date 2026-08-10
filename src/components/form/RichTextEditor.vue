<script setup lang="ts">
import { watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? '' }),
  ],
  editorProps: {
    attributes: {
      class: 'rich-text-content min-h-[3.5rem] px-2.5 py-2 text-sm text-ink outline-none',
    },
  },
  onUpdate: ({ editor: instance }) => {
    emit('update:modelValue', instance.getHTML())
  },
})

// Keep in sync with external changes (e.g. undo/redo replacing the whole
// invoice, or switching to a different invoice) without fighting the user's
// own typing — only push content back in when it actually diverges.
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  },
)

function isActive(name: string, attrs?: Record<string, unknown>) {
  return editor.value?.isActive(name, attrs) ?? false
}
</script>

<template>
  <div class="rounded-md border border-hairline bg-surface focus-within:border-accent">
    <div v-if="editor" class="flex items-center gap-0.5 border-b border-hairline px-1.5 py-1">
      <button
        type="button"
        title="Gras"
        class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition"
        :class="isActive('bold') ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        title="Italique"
        class="flex h-6 w-6 items-center justify-center rounded text-xs italic transition"
        :class="isActive('italic') ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        I
      </button>
      <button
        type="button"
        title="Barré"
        class="flex h-6 w-6 items-center justify-center rounded text-xs line-through transition"
        :class="isActive('strike') ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        S
      </button>
      <span class="mx-1 h-4 w-px bg-hairline-strong"></span>
      <button
        type="button"
        title="Liste à puces"
        class="flex h-6 w-6 items-center justify-center rounded text-sm transition"
        :class="isActive('bulletList') ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        •
      </button>
      <button
        type="button"
        title="Liste numérotée"
        class="flex h-6 w-6 items-center justify-center rounded text-xs transition"
        :class="isActive('orderedList') ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        1.
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.rich-text-content p {
  margin: 0;
}
.rich-text-content p + p {
  margin-top: 0.25em;
}
.rich-text-content ul,
.rich-text-content ol {
  margin: 0;
  padding-left: 1.25em;
}
.rich-text-content ul {
  list-style: disc;
}
.rich-text-content ol {
  list-style: decimal;
}
.rich-text-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--color-muted);
}
</style>
