<script setup>
import { ref, toRaw, computed, onMounted } from 'vue'
import api from '@/api'
import ProjectStat from '@/components/ProjectStat.vue'
import SvgDai from '@/components/SvgDai.vue'
import IconSplit from '@/components/IconSplit.vue'
import { toDAI, toDAIPerMo } from '@/utils'
import { BigNumber as bn } from 'ethers'
import store from '@/store'

const props = defineProps({
  project: Object,
  meta: Object,
  drips: Array,
  currentFundingWei: String,
  tallyTokens: Boolean
})

const isMonthly = toRaw(props.project.tokenTypes[0].streaming)

// const isMonthly = computed(() => {
//   return props.project?.tokenTypes && props.project.tokenTypes[0]?.streaming
// })

// const supporters = computed(() => {
//   if (props.project) {
//     // get all owners from nfts
//     let supporters = props.project.nfts.map(nft => nft.owner)
//     // dedupe
//     supporters = [...new Set(supporters)]
//     return supporters
//   }
//   return null
// })

const currency = (num) => {
  num = Number(num)
  num = num >= 1000 ? Math.round(Number(num) / 1000).toFixed(1)
    : num < 1 ? num.toFixed(2)
      : num.toFixed(0)
  return parseFloat(num)
  // : parseInt(num) - num < 0 ? num.toFixed(2) : num // remove trailing 0s
}

// drips in
const dripsIn = computed(() => {
  if (props.currentFundingWei) {
    return isMonthly ? toDAIPerMo(props.currentFundingWei)
      : toDAI(props.currentFundingWei, null, 0)
  }
  return undefined
})

// total revenue
const totalRevenue = computed(() => {
  if (props.project) {
    // use collected?
    let total = Number(toDAI(bn.from(props.project.daiCollected).add(props.project.daiSplit), 'exact'))
    // fallback to adding up tokens
    if (total === 0 && props.tallyTokens) {
      const key = isMonthly ? 'amtPerSec' : 'giveAmt'
      total = props.project.tokens.reduce((acc, curr) => acc.add(curr[key]), bn.from(0))
      total = isMonthly ? toDAIPerMo(total) : toDAI(total)
    }
    return total
  }
  return undefined
})

</script>

<template lang="pug">
section.project-stats.grid.grid-cols-4.gap-10
  //- supporters
  //- project-stat.flex-1.mx-5(:class="{'animate-pulse': !supporters}")
    template(v-slot:header)
      h6 🙂&nbsp; Members
    template(v-if="supporters") {{ supporters.length }}
      //- .flex.items-center
        | {{ supporters.length }}
        <span class="hiddenff ml-6 relative py-2 mt-3 -mr-6" style="font-size:0.65em;">
          span(style="filter: contrast(300%) hue-rotate(90deg)") 🙂
          .absolute.overlay.bg-violet-600(style="mix-blend-mode:darken")
        </span>
    template(v-else) ...

  //- drips from
  project-stat(:class="{'animate-pulse': !props.project}")
    template(v-slot:header)
      h6 🧩&nbsp; Memberships
    template(v-if="props.project")
      | {{ props.project.tokens.length }}
      //- .flex.items-center
        | {{ nfts.length }}
        <span class="hiddenff ml-6 relative py-2 mt-3" style="font-size:0.75em">
          span(style="filterff: grayscale(100%)") 💧
          .absolute.overlay.bg-violet-600(style="mix-blend-mode:darken")
        </span>
    template(v-else) ...
    //- (limit)
    .absolute.bottom-22.right-24.flex.items-center
      span.font-semibold.font-sans.text-base(v-if="!isMonthly")
        | max {{ props.project.tokenTypes[0].limit }}

  //- Drips In
  project-stat
    template(v-slot:header)
      h6 💧&nbsp; {{ isMonthly ? 'Incoming Drips' : 'Drips Collected' }}
    //- (drips in value)
    template(v-if="dripsIn !== undefined")
      .flex.items-end
        | {{ dripsIn }}
        span.ml-2(v-if="dripsIn >= 1000", style="font-size:0.75em") K
      //- dai | dai/mo
      .absolute.bottom-22.right-24.flex.items-center
        svg-dai.h-18.text-violet-650
        span.font-semibold.font-sans.text-base(v-if="isMonthly") /MO
    //- (loading...)
    template(v-else)
      .animate-pulse ...

  //- Goal
  //- project-stat(:class="{'animate-pulse': !props.meta}")
    //- TODO Dai/mo vs DAI
    template(v-slot:header)
      h6 🌈&nbsp; Goal
    template(v-if="props.meta")
      .flex.items-end
        | {{ props.meta.goal ? currency(props.meta.goal) : '?' }}
        span.ml-2(v-if="props.meta.goal >= 1000", style="font-size:0.75em") K
      .absolute.bottom-22.right-24.flex.items-center
        svg-dai.h-18.text-violet-650
        span.font-semibold.font-sans.text-base(v-if="isMonthly") /MO
    template(v-else) ...

  //- (total drips collected)
  template(v-if="isMonthly")
    project-stat
      template(v-slot:header)
        h6 🧮&nbsp; Total Drips Collected
        //- alt: 💰🥞🔋📈
      template(v-if="props.project")
        .flex.items-end
          | {{ currency(totalRevenue) }}
          span.ml-2(v-if="totalRevenue >= 1000", style="font-size:0.75em") K
        .absolute.bottom-22.right-24
          svg-dai.h-18.text-violet-650
      template(v-else) ...

  //- (goal)
  template(v-if="!isMonthly")
    project-stat
      template(v-slot:header)
        h6 🌈&nbsp; Goal
      //- (goal)
      template(v-if="props.meta")
        .flex.items-end
          | {{ props.meta.goal ? currency(props.meta.goal) : '?' }}
          span.ml-2(v-if="props.meta.goal >= 1000", style="font-size:0.75em") K
        .absolute.bottom-22.right-24.flex.items-center
          svg-dai.h-18.text-violet-650
          //- span.font-semibold.font-sans.text-base(v-if="isMonthly") /MO
      //- (loading)
      template(v-else)
        .animate-pulse ...

  //- drips
  project-stat.w-full(:class="{'animate-pulse': !drips}")
    template(v-slot:header)
      h6 💧&nbsp; Drips to
      //- h6.flex.items-center
        div
          <icon-split/>
        | Splits
    template(v-if="drips") {{ drips.length }}
    template(v-else) ...
    //- .flex.items-center 0 <span class="hiddenff ml-3" style="font-size:0.65em">💦</span>
</template>
