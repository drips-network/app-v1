<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Addr from '@/components/Addr.vue'
import FlexTruncate from '@/components/FlexTruncate.vue'
import ProjectProgressBar from '@/components/ProjectProgressBar.vue'
import store from '@/store'
import { ipfsUrl } from '@/utils'

const props = defineProps({
  project: Object
})

const meta = ref()
const members = computed(() => {
  const owners = props.project.tokens.map(token => token.owner)
  return [...new Set(owners)]
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

const getMeta = async () => {
  try {
    meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => getMeta())
</script>

<template lang="pug">
.project-thumb-progress.block.panel.bg-indigo-700.rounded-2xlb.p-16.text-violet-650
  //- header row
  header.-mt-8.flex.justify-between.items-center
    .flex.items-center
      //- left side
      router-link.h-80.flex.items-center.notouch_hover_text-white.transition.duration-150(:to="{name: 'project', params: { address: props.project.id }}")
        //- avatar
        .w-60.h-60.ml-4.relative.rounded-full.overflow-hidden
          img.absolute.overlay.object-cover.object-center(v-if="meta && meta.image", :src="ipfsUrl(meta.image)", alt="avatar")
          img.absolute.overlay.object-cover.object-center(v-else, src="~@/assets/project-avatar-default.png")
        //- name
        h3.ml-20.text-xl.font-semibold {{ project.name }}

      //- .ml-40.border.border-violet-800.text-ms.px-14.h-28.flex.items-center.rounded-full.text-violet-650(v-if="meta") {{ meta.descrip }}

    router-link.btn.btn-md.btn-violet.px-28.font-semibold.text-md.mr-10(:to="{name: 'project', params: { address: props.project.id }}") View

  //- progress bar row
  .mt-6.mx-1.h-80.rounded-full.bg-indigo-800(:class="{'animate-pulse': !meta}")
    project-progress-bar.text-white(v-if="meta && props.project", :meta="meta", :project="props.project", :currentFundingWei="currentFundingWei", @progress="e => $emit('progress', e)")

  //- info row
  .h-56.mt-10.flex.w-full.items-center.justify-between.font-semibold.text-base
    //- descrip
    flex-truncate.flex-1.mx-20.text-md
      | {{ meta ? meta.descrip : '...' }}

    .flex
      //- creator
      router-link.ml-6.flex-shrink-0.flex.rounded-full.bg-indigo-800.items-center.justify-between.pl-24.p-8.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(:to="{name: 'user', params: { address: props.project.owner }}")
        | Creator
        .ml-24
          user-avatar.w-40.h-40(:address="props.project.owner", blockieSize="40")
          //- .bg-indigo-850.p-6.rounded-full.flex.items-center
            user-avatar.w-40.h-40(:address="props.project.owner", blockieSize="40")
            addr.mx-12(:address="props.project.owner")

      //- (members)
      template(v-if="members.length")
        .ml-6.flex-shrink-0.flex.rounded-full.bg-indigo-800.items-center.justify-between.pl-24.pr-10
          | Members
          ul.ml-24.flex.flex-row-reverse
            //- final count
            template(v-if="members.length - 3 > 0")
              .min-w-40.px-12.h-40.-ml-8.flex.items-center.justify-center.rounded-2xlb.bg-indigo-950 +{{ members.length - 1 }}
            //- avatars...
            li(v-for="(address, i) in members.slice(0, 3)", :class="{'-mr-8': i > 0}")
              router-link.relative.notouch_hover_ring.w-40.h-40.rounded-full.block(:to="{ name: 'user', params: { address }}")
                user-avatar.w-40.h-40(:address="address", blockieSize="40")

  //- project-progress-bar.mt-16.bg-indigo-800(v-if="meta", :meta="meta", :project="props.project")

//- router-link.project-thumb-progress.relative.block.group(:to="{name: 'project', params: { address: props.project.id }}")
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
