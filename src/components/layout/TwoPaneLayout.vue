<template>
  <div class="grid grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-start">
    <div class="rounded-2xl border border-hairline bg-surface p-6 sm:p-7 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <slot name="form" />
    </div>
    <div class="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <slot name="preview" />
    </div>
  </div>
</template>
