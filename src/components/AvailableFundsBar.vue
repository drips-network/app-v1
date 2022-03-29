<script setup>
import { computed, toRaw } from 'vue'
import SvgDai from '@/components/SvgDai.vue'
import { toDAI, getDripPctFromAmts } from '@/utils'
const props = defineProps(['amts', 'tx', 'isModalSummary', 'dripPct'])
const emit = defineEmits(['collect'])

const num = wei => Number(toDAI(wei)).toFixed(2)

const toOwner = computed(() => props.amts ? num(props.amts[0]) : -1)
const toSplits = computed(() => props.amts ? num(props.amts[1]) : -1)
const totalFunds = computed(() => props.amts ? num(props.amts[0].add(props.amts[1])) : -1)

// const dripPct = computed(() => getDripPctFromAmts(props.amts))

// const hasFunds = computed(() => Number(totalFunds.value) > 0)
const hasFunds = computed(() => props.amts && props.amts[0].add(props.amts[1]).gt(0))
</script>

<template lang="pug">
.mt-20.flex.flex-wrap.rounded-2xlb.text-violet-650.p-10(:class="{'p-10ff': hasFunds}")
  .w-full.h-80.rounded-full.flex.justify-between.items-center.px-12(:class="{'border border-violet-700': hasFunds}")
    h4.ml-16.text-xl.font-semibold.text-white
      slot(name="allfunds")

    .flex.items-center.mr-16
      .text-2xl.font-semibold.flex.items-center(:class="{'text-white': hasFunds}")
        | {{ totalFunds > -1 ? totalFunds : '...' }}
        svg-dai.ml-12(size="xl")

  template(v-if="!isModalSummary || hasFunds")
    .mt-10(:class="{'flex-1 pr-2': !isModalSummary, 'w-full': isModalSummary}")
      .w-full.h-80.rounded-full.border.border-violet-700.flex.justify-between.items-center.px-12
        .flex-1.flex.justify-between.items-center
          h4.ml-16.text-xl.font-semibold 💦 &nbsp;Splitting {{ props.dripPct }}%
          .flex.items-center.mr-16
            .text-2xl.font-semibold.flex.items-center(:class="{'.text-white': !isModalSummary}")
              template(v-if="props.amts && props.amts[1].gt(0) && Number(toSplits) < 0.01") >
              | -{{ toSplits > -1 ? toSplits : '...' }}
              svg-dai.ml-12(size="xl")

    .mt-10(:class="{'flex-1 pl-2': !isModalSummary, 'w-full': isModalSummary}")
      .w-full.h-80.rounded-full.border.border-violet-700.flex.justify-between.items-center.px-12
        .flex-1.flex.justify-between.items-center
          h4.ml-16.text-xl.font-semibold
            slot(name="toyou")

          .flex.items-center
            .text-2xl.font-semibold.mr-16.flex.items-center(:class="{'text-white': isModalSummary}")
              | {{ toOwner > -1 ? toOwner : '...' }}
              svg-dai.ml-12(size="xl")

    template(v-if="!props.isModalSummary")
      button.mt-10.ml-6.px-40.btn-lg.btn-violet.font-semibold.rounded-full.px-20(@click.prevent="emit('collect')")
        template(v-if="tx") Collecting...
        template(v-else)
          | Collect
</template>
