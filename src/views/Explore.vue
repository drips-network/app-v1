<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumbProgress from '@/components/ProjectThumbProgress'
import LoadingBar from '@/components/LoadingBar'
import DripRow from '@/components/DripRow'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
import DripsAll from '@/components/DripsAll'

const projects = ref()

const getProjects = async () => {
  try {
    const resp = await api({
      query: `
        query {
          fundingProjects {
            id
            name: projectName
            owner: projectOwner
            daiCollected
            daiSplit
            tokenTypes {
              streaming
            }
          }
        }
      `
    })
    projects.value = resp.data?.fundingProjects || []
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => {
  getProjects()
})
</script>

<template lang="pug">
article.explore.pt-16
  //- header.flex.mt-12
    h1.h-80.rounded-full.flex.border.border-violet-600.ffbg-indigo-700.text-2xl.font-semibold.items-center.px-28.text-violet-650 Explore
  //- featured
  section
    header.flex.justify-center.sticky.top-5.z-20.mb-5
      .flex.bg-indigo-950.borderff.border-violet-600.rounded-full.items-center
        .h-80.w-80.flex.items-center.justify-center.text-xl ⭐️
        h2.-ml-12.text-lg.font-semibold.pr-40.text-violet-650 Spotlight
    //- header.pl-1.mb-28
      h1.text-3xl.font-semibold.px-32.text-violet-650 ✨ Featured

    section.mt-40.pb-40
      template(v-if="!projects")
        loading-bar

      template(v-else)
        ul
          li
            drip-row.mb-4(:drip="{ sender: '0x8b1A1aF63bb9b3730f62c56bDa272BCC69dF4CC7'.toLowerCase(), receiver: 10, percent: 100 }")
          //- projects...
          li.flex.mb-4(v-for="project in projects")
            //- user
            router-link.h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-3.w-260.border-2.border-transparent.notouch_hover_border-violet-600(:to="{name: 'user', params: { address: project.owner.toLowerCase() }}")
              //- sender avatar / blockie
              user-avatar.w-54.h-54.flex-shrink-0(:address="project.owner.toLowerCase()", blockieSize="44", :key="project.owner")

              .flex-1.min-w-0.truncate.inline.mx-12.text-center.text-md
                .inline.font-bold.inline
                  addr.font-bold.inline.text-violet-600(:address="project.owner.toLowerCase()", :youOn="true", :key="project.owner")

            //- drip icon
            .w-80.h-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-3
              span(style="font-size:1.75em") ✨

            .flex-1
              project-thumb-progress(:project="project")

  //- communities
  section
    header.flex.justify-center.sticky.top-5.z-20.mb-5
      .flex.bg-indigo-950.borderff.border-violet-600.rounded-full.items-center
        .h-80.w-80.flex.items-center.justify-center.text-xl 🙂
        h2.-ml-12.text-lg.font-semibold.pr-40.text-violet-650 Communities

    section.mt-40.pb-40
      template(v-if="!projects")
        loading-bar

      template(v-else)
        ul
          //- projects...
          li(v-for="project in projects")
            project-thumb-progress.mb-4(:project="project")

        //- footer.mt-56.flex.justify-center
          router-link.btn.btn-xl.btn-dark.px-60(to="/create") Create ✨

  //- drips
  section
    header.flex.justify-center.sticky.top-5.z-20.mb-5
      .flex.bg-indigo-950.borderff.border-violet-600.rounded-full.items-center
        .h-80.w-80.flex.items-center.justify-center.text-xl 💧
        h2.-ml-12.text-lg.font-semibold.pr-40.text-violet-650 Drips

    section.mt-40.pb-40
      drips-all.text-lg
</template>
