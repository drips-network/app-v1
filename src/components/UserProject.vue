<script setup>
import { ref, computed, onBeforeMount, toRaw } from 'vue'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar.vue'
import ProjectStats from '@/components/ProjectStats.vue'
import SvgDai from '@/components/SvgDai.vue'
import SvgQuestionMarkEncircled from '@/components/SvgQuestionMarkEncircled.vue'
import AvailableFundsBar from '@/components/AvailableFundsBar.vue'
import ModalCollectDrips from '@/components/ModalCollectDrips.vue'
import { ipfsUrl, toDAI, round, toDAIPerMo } from '@/utils'
import { BigNumber as bn } from 'ethers'

const props = defineProps({
  project: Object
})
const emit = defineEmits(['collected'])

const meta = ref()
const drips = ref()
const dripsPct = computed(() => drips.value?.reduce((acc, curr) => acc + curr.percent, 0))
const projectRt = { name: 'project', params: { address: props.project.id } }

const isAdmin = computed(() => props.project.projectOwner === store._state.data.address)
const isStreaming = toRaw(props.project.tokenTypes[0].streaming)

const collectModalOpen = ref(false)

// collectable ([dripsWei, splitsWei])
const collectableAmts = ref()

// total collectable (add drips + splits together)
const totalCollectable = computed(() => collectableAmts.value && collectableAmts.value[0].add(collectableAmts.value[1]))

// format for UI
const totalCollectableDAI = computed(() => {
  if (!collectableAmts.value) return -1
  return toDAI(totalCollectable.value)
})

// current funding
const currentFundingWei = computed(() => {
  // based on first token (for now)
  const tokenType = props.project.tokenTypes[0]
  if (tokenType) {
    return tokenType.streaming ? tokenType.currentTotalAmtPerSec : tokenType.currentTotalGiven
  }
  return undefined
})

const getCollectable = () => {
  store.dispatch('getCollectable', { projectAddress: props.project.id })
    .then(amounts => { collectableAmts.value = amounts })
}

const getProject = () => {
  store.dispatch('getProjectMeta', { projectAddress: props.project.id })
    .then(data => { meta.value = data })
}

const onCollected = () => {
  getProject()
  getCollectable()
}

onBeforeMount(() => {
  getProject()
  // get drips
  store.dispatch('getSplitsBySender', props.project.id)
    .then(splits => { drips.value = splits })
    .catch(() => { drips.value = [] })
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
    router-link.btn.btn-mdd.btn-violet.px-40.text-lg.font-semibold(:to="projectRt")
      | View

  //- progress bar
  project-progress-bar.mt-20.mb-20.bg-indigo-800(v-if="project && meta && meta.goal", :meta="meta", :project="project", :currentFundingWei="currentFundingWei")

  //- (funds)
  template(v-if="isAdmin")
    .panel.mt-20.bg-indigo-800.rounded-2xlb(:class="{'p-10': isStreaming}")

      //- (monthly drips in)
      template(v-if="isStreaming")
        div
          .h-80.mb-10.px-32.rounded-full.bg-indigo-850.font-semibold

              .h-80.w-full.flex.items-center.justify-between
                .flex-1.text-xl.text-violet-650 Monthly Drips-In
                .flex.items-center.text-white
                  .text-xl(:class="{'animate-pulse': !currentFundingWei }")
                    template(v-if="!currentFundingWei") ...
                    template(v-if="isStreaming")
                      | {{ toDAIPerMo(currentFundingWei) }}
                    template(v-else)
                      | toDAI(currentFundingWei) }}
                  svg-dai.h-20.ml-12
                  .text-lgg.tracking-tight /MO
                  //- button.ml-24.btn.btn-md.btn-violet.px-20.font-semibold.text-lg Collect

              //- .w-full.flex.items-center.justify-between
                .flex-1.text-xl.text-violet-650 Fully Collectable
                .flex.items-center.text-white
                  .text-xl 26 days

          //- .h-80.mt-5.px-32.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold

      .h-80.pl-32.pr-12.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold
          .flex-1.text-xl.text-violet-650.flex.items-center
            template(v-if="isStreaming") Collectable Today
            template(v-else) Collectable Funds
            //- svg-question-mark-encircled.ml-18

          .flex.items-center.text-white
            .text-xl(:class="{'animate-pulse': totalCollectableDAI < 0}")
              | {{ totalCollectableDAI < 0 ? '...' : totalCollectableDAI }}
            svg-dai.h-20.ml-12.mr-20
            //- (collect btn)
            template(v-if="totalCollectable")
              button.btn.btn-md.btn-violet.px-24.font-semibold.text-lg.notouch_hover_ring(, @click="collectModalOpen = true", :disabled="!totalCollectable.gt(0)")
                | Collect

  //- stats
  project-stats.mt-20(v-if="project", :project="project", :meta="meta", :drips="drips", :currentFundingWei="currentFundingWei")

  //- collect modal
  modal-collect-drips(v-if="collectModalOpen && meta", :open="collectModalOpen", @close="collectModalOpen = false", :amts="collectableAmts", @collected="onCollected", :projectAddress="props.project.id")
    template(v-slot:header) Collect Drips for<br>"{{ meta.name }}"
</template>
