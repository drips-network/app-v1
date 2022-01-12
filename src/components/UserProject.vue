<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import ProjectStats from '@/components/ProjectStats'
import SvgDai from '@/components/SvgDai'
import AvailableFundsBar from '@/components/AvailableFundsBar'
import { ipfsUrl, toDAI } from '@/utils'

const props = defineProps({
  project: Object
})
const emit = defineEmits(['collected'])

const meta = ref()
const drips = ref()
const dripsPct = computed(() => drips.value?.reduce((acc, curr) => acc + curr.percent, 0))
const projectRt = { name: 'project', params: { address: props.project.id } }

const isUsersProject = computed(() => props.project.projectOwner === store._state.data.address)

const collectableAmts = ref(0)

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
        router-link(:to="projectRt") {{ meta ? meta.name : $store.getters.addrShort(props.project.id) }}

    //- (join btn)
    template(v-if="!isUsersProject")
      router-link.btn.btn-mdd.btn-violet.px-40.text-lg.font-semibold(:to="projectRt") View

  //- progress bar
  project-progress-bar.mt-20.mb-20.bg-indigo-800(v-if="meta && project", :meta="meta", :project="project")

  //- (funds)
  template(v-if="isUsersProject")
    available-funds-bar.bg-indigo-800(:amts="collectableAmts", @collect="collect", :tx="tx", :dripPct="dripsPct")
      template(v-slot:allfunds) Collectable Funds
      template(v-slot:toyou)
        span.text-white You Receive

  //- stats
  project-stats.mt-20(v-if="project", :project="project", :meta="meta", :drips="drips")

</template>
