<script setup>
import { useSlots, computed } from 'vue'
import SvgDai from '@/components/SvgDai.vue'

const props = defineProps({
  label: String,
  // isFilled: [Number, Boolean], // input has content
  format: String,
  symbol: String,
  theme: { type: String, default: 'outline' },
  warning: String,
  error: String
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
  //- (label)
  label.absolute.top-0.left-0.w-full.text-center.text-mss.pt-4(v-if="label", :class="{'text-red-600': theme === 'red'}") {{ props.label }}

  //- field (input, textarea)
  .input-body__wrapper.min-h-80.flex.items-center.font-semibold.rounded-2xlb.text-center.leading-none.text-white.group(:class="[styling, themeing]")
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

    //- (symbol: percent)
    template(v-if="props.symbol === 'percent'")
      .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-24
        .flex.items-center.text-violet-600
          .text-xl.tracking-tight.font-bold %

    //- (bottom warning)
    template(v-if="props.warning || props.error")
      .absolute.bottom-0.z-10.left-0.w-full.text-center.text-sm.pb-3.transition.duration-150.font-normal.pointer-events-none.font-sans(:class="{'input-body__warning opacity-0 text-orange-600': props.warning && !props.error, 'text-red-500': props.error }")
        | {{ props.error || props.warning }}
        //- template(v-if="balance && Number(balance) > 0") Max Withdraw -{{balance}} DAI
        //- template(v-else) There are no funds to withdraw
</template>

<style lang="postcss">
  .input-body{
    & input {
      @apply w-full h-80 flex items-center pt-2;
      &::placeholder{
        /* TODO: maybe font style <label> instead of placeholder... */
        /* @apply text-xl; */
      }
    }
    & textarea {
      @apply w-full min-h-80 flex items-center pt-26 px-24 leading-tight;
      &::placeholder{
        @apply font-sans text-xl;
      }
    }

    /* show warning on input focus */
    & > .input-body__wrapper:focus-within,
    .input-warnings-visible & {
      & .input-body__warning{
        @apply opacity-100 pointer-events-auto;
      }
    }
  }
</style>
