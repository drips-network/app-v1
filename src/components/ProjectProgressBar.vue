<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import SvgDai from '@/components/SvgDai'
import { toDAI, toWei } from '@/utils'
import { BigNumber as bn } from 'ethers'
import api from '@/api'

const props = defineProps(['meta', 'project', 'rightSide'])
const isStreaming = toRaw(props.project.tokenTypes[0].streaming)

const pct = ref(-1)
const pctPretty = computed(() => {
  return pct.value < 0 ? ''
    : pct.value > 0 && pct.value < 1 ? '<1%'
      // : pct.value > 99 && pct.value < 100 ? '<99'
      : parseFloat(pct.value.toFixed(2)) + '%'
})

const getProjectStreamingTotalWei = async () => {
  // TODO - api doesn't consider active/inactive...
  try {
    const resp = await api({
      variables: { tokenRegistryAddress: props.project.id },
      query: `
        query ($tokenRegistryAddress: Bytes!) {
          tokens (where: {tokenRegistryAddress: $tokenRegistryAddress}) {
            tokenId
            amount: amtPerSec
            tokenType {
              streaming
            }
          }
        }
      `
    })
    let tokens = resp.data?.tokens || []
    // filter for streaming tokens, map to just BN amounts
    tokens = tokens.filter(tkn => tkn.tokenType.streaming).map(tkn => bn.from(tkn.amount))
    // add up BN amounts
    const totalWeiPerSec = tokens.reduce((acc, curr) => acc.add(curr), bn.from(0))
    // return monthly wei
    return totalWeiPerSec.mul(60 * 60 * 24 * 30)
  } catch (e) {
    console.error(e)
    throw e
  }
}

const getPercent = async () => {
  let percent = 0
  if (props.meta.goal > 0) {
    let sum = bn.from(0)

    if (isStreaming) {
      // streaming
      sum = await getProjectStreamingTotalWei()
    } else {
      // one-time payment = total collect + split
      // TODO - progress excludes splits(?
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
      sum = bn.from(props.project.daiCollected).add(props.project.daiSplit)
    }
    percent = sum.toString() / toWei(props.meta.goal).toString() * 100
  }
  pct.value = percent
}

onMounted(() => getPercent())
</script>

<template lang="pug">
.h-80.rounded-full.relative.flex(v-if="props.meta.goal")
  //- bar
  .relative.z-10.max-w-full.min-w-80.rounded-full.flex.justify-end.items-center.px-24.bg-gradient-to-r.from-turquoise-500.to-greenbright-500.overflow-hidden(:style="{width: Math.max(0, pct) + '%', transition: 'width 1000ms 100ms, opacity 500ms'}", :class="{'opacity-0': pct < 0}")
    template(v-if="rightSide !== 'percent'")
      div.transition.duration-500.delay-200(:class="{'opacity-0': pct < 0}")
        | {{ pctPretty }}
        template(v-if="pct >= 99.99") &nbsp;🎉
        template(v-else-if="pct > 90") &nbsp;🔥
  //- right info
  .absolute.top-0.right-0.h-full.flex.items-center.pr-32
    //- (percent)
    .relative.z-10(v-if="rightSide === 'percent'")
      template(v-if="pct > -1")
        | {{ pctPretty }}
        template(v-if="pct >= 99.99") &nbsp;🎉
        template(v-else-if="pct > 90") &nbsp;🔥

    //- (goal)
    template(v-else)
      svg-dai.mr-4(size="sm")
      span.text-lg.font-semibol
        | {{ typeof meta.goal === 'number' ? meta.goal.toLocaleString() : '?' }}{{ isStreaming ? '/mo' : '' }}
</template>
