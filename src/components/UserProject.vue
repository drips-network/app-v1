<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import ProjectStats from '@/components/ProjectStats'
import SvgDai from '@/components/SvgDai'

const props = defineProps({
  project: Object
})

const meta = ref({})
const projectRt = { name: 'project', params: { address: props.project.id } }

const isUsersProject = computed(() => props.project.projectOwner === store._state.data.address)

const collect = () => {
  store.dispatch('collectProjectFunds', { projectAddress: props.project.id })
}

onBeforeMount(async () => {
  meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
})
</script>

<template lang="pug">
.user-project.panel-indigo.mb-40.p-24
  //- avatar + title
  header.flex.justify-between.items-center.mb-32
    .flex.items-center
      //- avatar
      router-link.h-80.w-80.bg-indigo-800.rounded-full.mr-24(:to="projectRt")
      //- title
      h3.text-2xl.font-semibold.text-violet-650
        router-link(:to="projectRt") {{ meta.name || $store.getters.addrShort(props.project.id) }}

  //- progress bar
  project-progress-bar.my-20(:meta="meta")

  //- (funds)
  template(v-if="isUsersProject")
    .mt-20.h-80.rounded-full.bg-indigo-800.flex.justify-between.items-center
      h4.ml-32.text-xl.font-semibold Available Funds
      .flex.items-center.mr-16
        .text-2xl.font-semibold.mr-32.flex.items-center
          svg-dai.mr-12(size="xl")
          | {{ project.daiCollected.toString() }}
        button.btn-md.btn-violet.text-md.font-semibold.rounded-full.px-20(@click="collect") WITHDRAW

  //- stats
  project-stats.mt-20(v-if="project", :project="project", :meta="meta")

</template>
