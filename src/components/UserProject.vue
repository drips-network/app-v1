<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'

const props = defineProps({
  project: Object
})

const meta = ref({})
const projectRt = { name: 'project', params: { address: props.project.id } }

const isUsersProject = computed(() => props.project.projectOwner === store._state.data.address)

onBeforeMount(async () => {
  meta.value = await store.dispatch('getProjectMeta', props.project.id)
})
</script>

<template lang="pug">
.user-project.panel-indigo.mb-40.p-24
  template(v-if="meta")
    header
      .flex.items-center
        //- avatar
        router-link.h-80.w-80.bg-indigo-800.rounded-full.mr-24(:to="projectRt")
        //- title
        h3.text-2xl.font-semibold
          router-link(:to="projectRt") {{ meta.name }}

    //- .mt-24.h-80.rounded-full.bg-indigo-800.flex.justify-between.items-center.px-32(v-if="isUsersProject")
      h4.text-lg.font-semibold Project Funds
      .flex.items-center
        .text-xl.font-semibold.mr-32 {{ project.daiCollected }} DAI
        button.btn-md.border.border-violet-700.text-md.font-semibold.rounded-full.px-20.mr-12.cursor-not-allowed WITHDRAW
        button.btn-md.border.border-violet-700.text-md.font-semibold.rounded-full.px-20.cursor-not-allowed COLLECT

</template>
