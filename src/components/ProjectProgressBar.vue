<script setup>
import { ref, computed, onMounted, toRaw, watch } from 'vue'
import SvgDai from '@/components/SvgDai.vue'
import { toDAI, toWei, oneMonth } from '@/utils'
import { BigNumber as bn } from 'ethers'
import api from '@/api'
import store from '@/store'

const props = defineProps(['meta', 'project', 'rightSide', 'currentFundingWei'])
const emit = defineEmits(['progress'])

const isStreaming = toRaw(props.project.tokenTypes[0]?.streaming)

// raw percent
const pct = computed(() => {
  if (!props.currentFundingWei || !props.meta.goal) return -1
  // calc
  let wei = props.currentFundingWei.toString()
  if (isStreaming) {
    wei = wei * oneMonth
  }
  return wei / toWei(props.meta.goal).toString() * 100
})

// pretty percent
const pctPretty = computed(() => {
  return pct.value < 0 ? '...' // loading
    : pct.value > 0 && pct.value < 1 ? '<1%'
      // : pct.value > 99 && pct.value < 100 ? '<99'
      // : parseFloat(pct.value.toFixed(0)) + '%'
      : parseInt(pct.value) + '%'
})

emit('progress', pct.value)
</script>

<template lang="pug">
.h-80.rounded-full.relative.flex(v-if="props.meta.goal")
  //- bar
  .relative.z-10.max-w-full.min-w-80.rounded-full.flex.justify-end.items-center.px-24.bg-gradient-to-r.from-turquoise-500.to-greenbright-500.overflow-hidden(:style="{width: Math.max(0, pct) + '%', transition: 'width 1000ms 100ms, opacity 500ms'}", :class="{'opacity-0': pct === -1}")
    //- (percent internal)
    template(v-if="rightSide !== 'percent'")
      div.transition.duration-500.delay-200.font-semibold(:class="{'opacity-0': pct < 0}")
        | {{ pctPretty }}
        template(v-if="pct >= 99.99") &nbsp;🎉
        template(v-else-if="pct > 90") &nbsp;🔥

  //- right info
  .absolute.top-0.right-0.h-full.flex.items-center.pr-32
    //- (percent)
    .relative.z-10(v-if="rightSide === 'percent'")
      template(v-if="pct > -1")
        | {{ pctPretty }} of Goal
        template(v-if="pct >= 99.99") &nbsp;🎉
        template(v-else-if="pct > 90") &nbsp;🔥

    //- (goal)
    template(v-else)
      svg-dai.mr-4(size="sm")
      span.text-md.font-semibold
        | {{ typeof meta.goal === 'number' ? meta.goal.toLocaleString() : '?' }}{{ isStreaming ? '/mo' : '' }}
</template>
