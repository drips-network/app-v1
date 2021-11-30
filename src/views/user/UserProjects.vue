<script setup>
import UserProject from '@/components/UserProject'
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'
import LoadingBar from '@/components/LoadingBar'

const route = useRoute()

const projects = ref()

const fetchUserProjects = (projectOwner) => {
  return api({
    variables: { projectOwner },
    query: `
      query ($projectOwner: Bytes!) {
        fundingProjects (where: { projectOwner: $projectOwner }) {
          id
          projectOwner
          daiCollected
        }
      }
    `
  })
}

onBeforeMount(async () => {
  try {
    const resp = await fetchUserProjects(route.params.address)
    projects.value = resp.data.fundingProjects
  } catch (e) {
    console.error(e)
  }
})
</script>

<template lang="pug">
section.user-projects
  h2.sr-only Projects

  //- p.mx-40.mb-40.border.border-violet-700.rounded-full.text-md.text-violet-650.h-80.flex.items-center.justify-center
    div Incoming funds from <b>Drips</b> form <b>Pools</b>.

  template(v-if="projects")
    info-bar.justify-center.px-32.mb-20
      div
        template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;raising funds in <b>{{ projects.length }} project{{ projects.length === 1 ? '' : 's' }}</b>

    ul
      //- projects...
      li(v-for="project in projects")
        user-project(:project="project")

  template(v-else)
    loading-bar
</template>
