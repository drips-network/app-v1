<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  label: String,
  isFilled: [Number, Boolean], // input has content
  format: String
})

const styling = computed(() => {
  switch (props.format) {
    case 'code': return 'font-mono text-lg'
    default: return 'text-xl'
  }
})

const slots = useSlots()
</script>

<template lang="pug">
.input-body.relative
  label.absolute.top-0.left-0.w-full.text-center.text-sm.text-violet-600.pt-4(:class="{'opacity-0': !isFilled}") {{ props.label }}

  //- field (input, textarea)
  .min-h-80.flex.items-center.font-semibold.border.border-violet-700.rounded-2xl.focus-within_border-violet-600.text-center(:class="[styling]")
    slot
</template>

<style lang="postcss">
  .input-body{
    & input {
      @apply w-full h-80 flex items-center;
    }
    & textarea {
      @apply w-full min-h-80 flex items-center;
    }
  }
</style>
