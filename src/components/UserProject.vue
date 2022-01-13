<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import ProjectStats from '@/components/ProjectStats'
import SvgDai from '@/components/SvgDai'
import SvgQuestionMarkEncircled from '@/components/SvgQuestionMarkEncircled'
import AvailableFundsBar from '@/components/AvailableFundsBar'
import { ipfsUrl, toDAI, round } from '@/utils'

const props = defineProps({
  project: Object
})
const emit = defineEmits(['collected'])

const meta = ref()
const drips = ref()
const dripsPct = computed(() => drips.value?.reduce((acc, curr) => acc + curr.percent, 0))
const projectRt = { name: 'project', params: { address: props.project.id } }

const isUsersProject = computed(() => props.project.projectOwner === store._state.data.address)

// collectable: [drips, splits]
const collectableAmts = ref()
// add drips + splits together
const totalCollectableDAI = computed(() => collectableAmts.value && toDAI(collectableAmts.value[0].add(collectableAmts.value[1])))
// format for UI
const totalCollectableDAIFrmttd = computed(() => !collectableAmts.value ? -1
  : totalCollectableDAI.value > 0 && totalCollectableDAI.value < 0.01 ? '<0.01'
    : round(totalCollectableDAI.value))

// current funding (received from progress bar)
const currentFundingAmt = ref(-1)

// collect action
const tx = ref()
const collect = async () => {
  try {
    tx.value = await store.dispatch('collectFunds', { projectAddress: props.project.id })
    await tx.value.wait()
    emit('collected')
    getCollectable()
    tx.value = null
  } catch (e) {
    alert('Error collecting: ' + e.message)
    collecTx.value = null
  }
}

const getCollectable = () => {
  store.dispatch('getCollectable', { projectAddress: props.project.id })
    .then(amounts => { collectableAmts.value = amounts })
}

onBeforeMount(() => {
  // get meta
  store.dispatch('getProjectMeta', { projectAddress: props.project.id })
    .then(data => { meta.value = data })
  // get drips
  store.dispatch('getSplitsReceivers', props.project.id)
    .then(receivers => { drips.value = receivers.percents })
  //
  getCollectable()
})
</script>

<template lang="pug">
.user-project.panel-indigo.mb-36.p-24
  //- avatar + title
  header.flex.justify-between.items-center
    .flex.items-center
      //- avatar
      router-link.relative.h-80.w-80.bg-indigo-800.rounded-full.mr-24.overflow-hidden(:to="projectRt")
        img.absolute.overlay.object-cover.object-center(v-if="meta && meta.image", :src="ipfsUrl(meta.image)")
        img.absolute.overlay.object-cover.object-center(v-else, src="~@/assets/project-avatar-default.png")
      //- title
      h3.text-2xl.font-semibold.text-violet-650
        router-link(:to="projectRt")
          | {{ meta ? meta.name : $store.getters.addrShort(props.project.id) }}

    //- (join btn)
    template(v-if="!isUsersProject")
      router-link.btn.btn-mdd.btn-violet.px-40.text-lg.font-semibold(:to="projectRt")
        | View

  //- progress bar
  project-progress-bar.mt-20.mb-20.bg-indigo-800(v-if="meta && project", :meta="meta", :project="project", rightSide="percent", @currentFundingAmt="amt => { currentFundingAmt = amt }")

  //- (funds)
  template(v-if="isUsersProject")
    .panel.mt-20.bg-indigo-800.rounded-2xlb.p-10

      div
        .h-80.mt-5.px-32.rounded-full.bg-indigo-850.grid.grid-cols-2.gap-64.font-semibold

            .w-full.flex.items-center.justify-between
              .flex-1.text-xl.text-violet-650 Monthly Drips In
              .flex.items-center.text-white
                .text-xl(:class="{'animate-pulse': currentFundingAmt < 0 }")
                  | {{ currentFundingAmt < 0 ? '...' : round(toDAI(currentFundingAmt)) }}
                svg-dai.h-20.ml-12
                .text-lgg.tracking-tight /MO
                //- button.ml-24.btn.btn-md.btn-violet.px-20.font-semibold.text-lg Collect

            .w-full.flex.items-center.justify-between
              .flex-1.text-xl.text-violet-650 Fully Collectable
              .flex.items-center.text-white
                .text-xl 26 days

        //- .h-80.mt-5.px-32.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold

      .mt-5.grid.grid-cols-1.gap-5
        //- .h-80.px-32.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold
            .flex-1.text-xl.text-violet-650 Members
            .flex.items-center.text-white
              .text-xl 3

        .flex.w-full.items-center
          .flex-1
            .h-80.pl-32.pr-12.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold
                .flex-1.text-xl.text-violet-650.flex.items-center
                  | Collectable Today
                  //- svg-question-mark-encircled.ml-18

                .flex.items-center.text-white
                  .text-xl(:class="{'animate-pulse': totalCollectableDAIFrmttd < 0}")
                    | {{ totalCollectableDAIFrmttd < 0 ? '...' : totalCollectableDAIFrmttd }}
                  svg-dai.h-20.ml-12.mr-20
                  //- .text-xl.tracking-tight.text-violet-650 /MO
                  button.btn.btn-md.btn-violet.px-20.font-semibold.text-lg.notouch_hover_ring
                    | Collect
          //- .h-80.flex.items-center.justify-center.p-12.bg-indigo-850.rounded-full
            button.btn.btn-md.btn-violet.px-20.font-semibold.text-lg Collect
          //- button.ml-6.h-80.rounded-full.bg-violet-600.flex.items-center.px-36.font-semibold.text-lgg Collect

            //- svg-dai.h-20.ml-12
    //- available-funds-bar.bg-indigo-800(:amts="collectableAmts", @collect="collect", :tx="tx", :dripPct="dripsPct")
      template(v-slot:allfunds) Collectable Funds
      template(v-slot:toyou)
        span.text-white You Receive

  //- stats
  project-stats.mt-20(v-if="project", :project="project", :meta="meta", :drips="drips")

</template>
