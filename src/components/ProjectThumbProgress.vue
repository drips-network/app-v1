<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import ProjectProgressBar from '@/components/ProjectProgressBar'
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
router-link.project-thumb-progress.relative.block(:to="{name: 'project', params: { address: props.project.id }}")
  //- progress as background
  .absolute.overlay(v-if="meta")
    project-progress-bar(:meta="meta", :project="props.project", :goalHidden="true")

  .h-80.w-full.rounded-full.flex.items-center.justify-between.border.border-violet-700.px-14
    //- profile icon
    .relative.z-10.w-54.h-54.rounded-full.overflow-hidden
      img.absolute.overlay.object-cover.object-center(v-if="meta && meta.image", :src="ipfsUrl(meta.image)", alt="avatar")

    //- user icon
    //- router-link.flex.items-center.px-8(:to="{name: 'user', params: {address: props.project.owner}}").flex.items-center
      .border-6.border-transparent.notouch_hover_border-violet-700.rounded-full
        avatar-blockie.w-54(:address="props.project.owner", width="54")

    //- title
    .relative.z-10.flex-1.text-xl.font-semibold.text-center
      | {{ project.name }}
    .w-54

  //- hover ring
  //- .absolute.z-10.rounded-full.overlay.border-2.border-transparent.notouch_group-hover_border-white.pointer-events-none
</template>
