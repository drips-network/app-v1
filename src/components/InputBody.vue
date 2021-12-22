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
    // case 'red': return 'borderff border-red-600ff focus-within_border-red-500ff'
    default: return ''
  }
})

const slots = useSlots()
</script>

<template lang="pug">
.input-body.relative.text-violet-600
  label.absolute.top-0.left-0.w-full.text-center.text-mss.pt-4(:class="{'opacity-0ff': !isFilled, 'text-red-600': theme === 'red'}") {{ props.label }}

  //- field (input, textarea)
  .min-h-80.flex.items-center.font-semibold.rounded-2xlb.text-center.leading-none.text-white(:class="[styling, themeing]")
    slot

    //- (symbol: dai)
    template(v-if="props.symbol === 'dai'")
      .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-20
        .flex.items-center
          svg-dai(size="lg").text-violet-600

    //- (symbol: daipermo)
    template(v-if="props.symbol === 'daipermo'")
      .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-20
        .flex.items-center.text-violet-600
          svg-dai(size="lg")
          .text-lg.tracking-tight /MO

    //- (symbol: months)
    template(v-if="props.symbol === 'months'")
      .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-20
        .flex.items-center.text-violet-600
          .text-lg.tracking-tight MO
</template>

<style lang="postcss">
  .input-body{
    & input {
      @apply w-full h-80 flex items-center;
      &::placeholder{
        /* TODO: maybe font style <label> instead of placeholder... */
        /* @apply text-xl; */
      }
    }
    & textarea {
      @apply w-full min-h-80 flex items-center pt-26 text-left px-24 leading-tight;
      &::placeholder{
        @apply font-sans text-xl;
      }
    }
  }
</style>
