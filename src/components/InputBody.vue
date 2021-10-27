<script setup>
import { useSlots, computed } from 'vue'
import SvgDai from '@/components/SvgDai'

const props = defineProps({
  label: String,
  isFilled: [Number, Boolean], // input has content
  format: String,
  symbol: String,
  theme: { type: String, default: 'outline' }
})

const styling = computed(() => {
  switch (props.format) {
    case 'code': return 'font-mono text-lg'
    default: return 'text-xl'
  }
})

const themeing = computed(() => {
  switch (props.theme) {
    case 'outline': return 'border border-violet-700 focus-within_border-violet-600'
    case 'dark': return 'bg-indigo-900'
    default: return ''
  }
})

const slots = useSlots()
</script>

<template lang="pug">
.input-body.relative
  label.absolute.top-0.left-0.w-full.text-center.text-sm.text-violet-600.pt-4(:class="{'opacity-0': !isFilled}") {{ props.label }}

  //- field (input, textarea)
  .min-h-80.flex.items-center.font-semibold.rounded-2xl.text-center(:class="[styling, themeing]")
    slot

    //- (symbol: daipermo)
    template(v-if="props.symbol === 'daipermo'")
      .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-24
        .flex.items-center
          svg-dai(size="lg")
          .text-lg.ml-4.tracking-tight / MO
</template>

<style lang="postcss">
  .input-body{
    & input {
      @apply w-full h-80 flex items-center;
      &::placeholder{
        /* TODO: maybe font style <label> instead of placeholder... */
        @apply font-sans text-xl;
      }
    }
    & textarea {
      @apply w-full min-h-80 flex items-center;
      &::placeholder{
        @apply font-sans text-xl;
      }
    }
  }
</style>
