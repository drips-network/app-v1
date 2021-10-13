<script setup>
import { ref, onBeforeMount } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import store from '@/store'

const props = defineProps({
  project: Object
})

const meta = ref()

onBeforeMount(async () => {
  meta.value = await store.dispatch('getProjectMeta', props.project.id)
})

</script>

<template lang="pug">
.project-thumb-progress.h-80.rounded-full.bg-indigo-800.flex.border.border-violet-700.hover_bg-indigo-700
  router-link.flex.items-center.px-8(:to="{name: 'user', params: {address: props.project.projectOwner}}").flex.items-center
    .border-6.border-transparent.notouch_hover_border-violet-700.rounded-full
      avatar-blockie.w-54(:address="props.project.projectOwner", width="54")
  router-link.flex-1.text-xl.font-semibold.flex.items-center.justify-center(:to="{name: 'project', params: { address: props.project.id }}")
    | {{ meta ? meta.name : $store.getters.addrShort(props.project.id) }}
  .w-54
</template>
