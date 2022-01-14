<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumb from '@/components/ProjectThumb'
import LoadingBar from '@/components/LoadingBar'
import DripRow from '@/components/DripRow'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
import DripsAll from '@/components/DripsAll'
import InfoBar from '@/components/InfoBar'
import HeaderLarge from '@/components/HeaderLarge'

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
            tokens (first: 5) {
              owner: tokenReceiver
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
article.explore.pt-16.px-24
  //- header.flex.mt-12
    h1.h-80.rounded-full.flex.border.border-violet-600.ffbg-indigo-700.text-2xl.font-semibold.items-center.px-28.text-violet-650 Explore
  //- featured
  section
    header
      header-large(icon="✨")
        h2 Spotlight

    section.mt-48
      template(v-if="!projects")
        loading-bar

      template(v-else)
        ul
          li
            drip-row.mb-4(:drip="{ sender: '0x8b1A1aF63bb9b3730f62c56bDa272BCC69dF4CC7'.toLowerCase(), receiver: 10, percent: 100 }")

          //- template(v-if="projects")
            //- projects...
            li(v-for="project in projects")
              project-thumb.mb-24(:project="project")

  //- communities
  section.mt-80
    header-large(icon="🙂")
      h2 Communities

    section.mt-48
      template(v-if="!projects")
        loading-bar

      template(v-else)
        section.px-12ff
          info-bar.mb-16.text-md
            .w-full.text-center.px-32
              | These #[b communities] are #[b raising funds] with #[b NFT memberships] 🧩

          //- .my-40.text-base.text-violet-650.text-center
            | #[b {{ projects.length }} communities] are #[b raising funds] with #[b NFT memberships] 🧩

          ul
            //- projects...
            li(v-for="project in projects")
              project-thumb.mb-32(:project="project")

          //- footer.mt-56.flex.justify-center
            router-link.btn.btn-xl.btn-dark.px-60(to="/create") Create ✨

  //- drips
  section.mt-80
    header-large(icon="💧")
      h2 Drips

    section.mt-48.pb-40
      drips-all.text-lg
</template>
