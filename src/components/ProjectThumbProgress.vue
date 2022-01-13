<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import UserAvatar from '@/components/UserAvatar'
import Addr from '@/components/Addr'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import store from '@/store'
import { ipfsUrl } from '@/utils'

const props = defineProps({
  project: Object
})

const meta = ref()
// const members = computed(() => {
//   const owners = props.project.tokens.map(token => token.owner)
//   return [...new Set(owners)]
// })

onBeforeMount(async () => {
  meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
})
</script>

<template lang="pug">
router-link.project-thumb-progress.relative.block.group(:to="{name: 'project', params: { address: props.project.id }}")
  //- progress as background
  .absolute.overlay(v-if="meta")
    project-progress-bar(:meta="meta", :project="props.project", rightSide="percent")

  //- row body
  .h-80.w-full.rounded-full.flex.items-center.justify-between.bg-indigo-700.border-2.border-transparent.notouch_group-hover_border-violet-600
    //- profile icon
    .w-80.h-80.relative.z-10.flex.items-center.justify-center.-ml-2
      .w-54.h-54.relative.rounded-full.overflow-hidden
        img.absolute.overlay.object-cover.object-center(v-if="meta && meta.image", :src="ipfsUrl(meta.image)", alt="avatar")

    //- title
    .relative.z-10.flex-1.text-lg.font-semibold.text-center
      | {{ project.name }}
    .w-54

  //- hover ring
  //- .absolute.z-10.rounded-full.overlay.border-2.border-transparent.notouch_group-hover_border-white.pointer-events-none
</template>
