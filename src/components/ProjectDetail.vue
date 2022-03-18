<script setup>
import { ref, onMounted, nextTick, computed, toRaw } from 'vue'
import SvgChevronDown from '@/components/SvgChevronDown'
import SvgDai from '@/components/SvgDai'
import { ipfsUrl, toDAI, toDAIPerMo } from '@/utils'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import UserAvatarsRow from '@/components/UserAvatarsRow'
import { BigNumber as bn } from 'ethers'
import UserTagSmall from '@/components/UserTagSmall'
import DripsListExpands from '@/components/DripsListExpands'
const props = defineProps(['project'])
const meta = ref()

const benefitsEl = ref()
const benefitsLong = ref(false)
const readMore = ref(false)
const showMembers = ref(false)

const isStreaming = toRaw(props.project.tokenTypes[0].streaming)

let minAmt = toRaw(props.project.tokenTypes[0].minAmt)
minAmt = isStreaming ? toDAIPerMo(minAmt) : toDAI(minAmt)

const currentFundingWei = isStreaming ? toRaw(props.project.tokenTypes[0].currentTotalAmtPerSec)
  : toRaw(props.project.tokenTypes[0].currentTotalGiven)

const membersAddrs = toRaw(props.project.tokens.map(tkn => tkn.owner))

// raised = total collected + total split
let raised
const totalCollectedWei = bn.from(props.project.daiCollected).add(props.project.daiSplit).toString() 
if (bn.from(totalCollectedWei).lt(currentFundingWei)) {
  // use current funding if greater than what's been collected
  raised = isStreaming ? toDAIPerMo(currentFundingWei) : toDAI(currentFundingWei)
} else {
  // use total collected
  raised = toDAI(totalCollectedWei)
}

const getMeta = async () => {
  try {
    meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
    await nextTick()
    benefitsLong.value = benefitsEl.value && benefitsEl.value.scrollHeight > benefitsEl.value.offsetHeight
  } catch (e) {
    console.error(e)
  }
}

// splits
const splitsOut = ref()
const getSplitsOut = async () => {
  try {
    const splits = await store.dispatch('getSplitsBySender', props.project.id)
    // format + save
    splitsOut.value = splits.map(split => ({
      ...split,
      receiver: [split.receiver]
    }))
  } catch (e) {
    console.error(e)
    splitsOut.value = []
  }
}

onMounted(() => {
  getMeta()
  getSplitsOut()
})
</script>

<template lang="pug">
.project-detail.w-full.max-w-4xl
  //- image
  figure.mx-auto.w-8x12.relative.z-10
    .w-full.relative
      .aspect-w-1.aspect-h-1
      img.absolute.block.overlay.object-contain.object-bottom(:src="ipfsUrl(props.project.tokenTypes[0].ipfsHash)")
      //- caption
      figcaption.absolute.top-full.w-full.left-0.text-center.text-sm.text-violet-650.pt-5
        | Membership NFT
  
  //- body
  .-mt-40.rounded-2xlb.bg-indigo-700.pt-96.pb-40.relative
    .flex.justify-center.flex-wrap
      //- min
      .mx-4.h-64.rounded-full.bg-indigo-800.flex.items-center.justify-center.min-w-160.px-32.text-lg.text-violet-650.font-semibold
        svg-dai.mr-2(size="md")
        | {{ minAmt }}
        template(v-if="props.project.tokenTypes[0].streaming") /mo
        //- .text-lgg.tracking-tight /MO
          
          
      //- join btn
      button.mx-4.btn.btn-mdd.btn-violet.text-lg.font-semibold.min-w-160.px-40 Join
    
    //- benefits
    template(v-if="meta && meta.benefits.length")
      .mt-40.px-36.text-center.font-semibold.text-md.leading-normal(ref="benefitsEl", v-html="meta.benefits", :class="{'line-clamp-4': !readMore}")
      //- readmore/less btn
      template(v-if="benefitsLong")
        .absolute.bottom-0.left-0.w-full.flex.justify-center.pb-7
          button.text-violet-650.notouch_hover_text-white(@click="readMore = !readMore")
            svg-chevron-down.w-32.h-32(:class="{'transform rotate-180': readMore}")

  //- (progress bar)
  template(v-if="meta && meta.goal")
    project-progress-bar.bg-indigo-700.mt-5(:project="project", :meta="meta", :currentFundingWei="currentFundingWei")

  .text-md.font-semibold
    
    //- (members section)
    template(v-if="props.project.tokens.length")
      //- members summary row
      header.relative.mt-5.h-80.flex.items-center.justify-between.pl-32.rounded-full.bg-indigo-700(v-show="!showMembers")
        h6.text-violet-650.text-md.font-semibold Members
        user-avatars-row.mr-10(:addresses="membersAddrs", :limit="3")

        //- expand btn as overlay (accessibility)
        button.absolute.overlay.rounded-full.btn-focus-violet(@click="showMembers = !showMembers", aria-label="View Members")

      //- (members list expanded)
      ul.flex.flex-wrap.justify-center.my-5.bg-indigo-700.rounded-2xl.relative.pb-64(v-if="showMembers")
        .w-full.flex.justify-between.h-80.items-center.font-semibold
          h6.ml-32.text-violet-650 Members
          .w-54.h-54.mr-6.flex.items-center.justify-center {{ props.project.tokens.length }}

        li(v-for="token in props.project.tokens")
          user-tag-small.bg-indigo-850(:address="token.owner")

        //- close button
        .absolute.bottom-0.left-0.w-full.flex.justify-center.pb-7
          button.text-violet-650.notouch_hover_text-white(@click="showMembers = false", aria-label="Hide Members")
            svg-chevron-down.w-32.h-32.transform.rotate-180

    //- stats
    .grid.grid-cols-2.gap-4.mt-5
      //- raised:
      .h-80.bg-indigo-700.flex.items-center.justify-between.px-32.rounded-full
        h6.text-violet-650 Raised
        .flex.items-center
          svg-dai.mr-2(size="md")
          | {{ raised }}

      //- available
      .h-80.bg-indigo-700.flex.items-center.justify-between.px-32.rounded-full
        h6.text-violet-650 Available
        div
          template(v-if="isStreaming")
            span(style="font-size:1.5em") ∞
          template(v-else-if="!props.project.tokens.length") {{ props.project.tokenTypes[0].limit }}
          template(v-else) {{ props.project.tokenTypes[0].limit - props.project.tokens.length }}/{{ props.project.tokenTypes[0].limit }}

  //- drips list
  drips-list-expands(:address="props.project.id", :drips="splitsOut", direction="out")
    
</template>