<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'

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
  header.flex.justify-between.items-center
    .flex.items-center
      //- avatar
      router-link.h-80.w-80.bg-indigo-800.rounded-full.mr-24(:to="projectRt")
      //- title
      h3.text-2xl.font-semibold
        router-link(:to="projectRt") {{ meta.name || $store.getters.addrShort(props.project.id) }}

    button.btn-md.btn-darker.text-md.font-semibold.rounded-full.px-20(v-if="isUsersProject", @click="collect") COLLECT

  //- .mt-24.h-80.rounded-full.bg-indigo-800.flex.justify-between.items-center.px-32(v-if="isUsersProject")
    h4.text-lg.font-semibold Project Funds
    .flex.items-center
      .text-xl.font-semibold.mr-32 {{ project.daiCollected.toString() }} DAI
      button.btn-md.border.border-violet-700.text-md.font-semibold.rounded-full.px-20(@click="collect") WITHDRAW

</template>
