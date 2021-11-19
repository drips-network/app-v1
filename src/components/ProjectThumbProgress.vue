<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import store from '@/store'
import { ipfsUrl } from '@/utils'

const props = defineProps({
  project: Object
})

const meta = ref()

onBeforeMount(async () => {
  meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
})
</script>

<template lang="pug">
router-link.project-thumb-progress.h-80.rounded-full.bg-indigo-800ff.flex.items-center.justify-between.border.border-violet-700.hover_bg-indigo-700.px-14(:to="{name: 'project', params: { address: props.project.id }}")
  //- profile icon
  .w-54.h-54.relative.rounded-full.overflow-hidden
    img.absolute.overlay.object-cover.object-center(v-if="meta && meta.image", :src="ipfsUrl(meta.image)", alt="avatar")

  //- user icon
  //- router-link.flex.items-center.px-8(:to="{name: 'user', params: {address: props.project.owner}}").flex.items-center
    .border-6.border-transparent.notouch_hover_border-violet-700.rounded-full
      avatar-blockie.w-54(:address="props.project.owner", width="54")

  //- title
  .flex-1.text-xl.font-semibold.text-center
    | {{ project.name }}
  .w-54
</template>
