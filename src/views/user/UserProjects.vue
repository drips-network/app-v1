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

const getUsersProjects = async () => {
  try {
    const resp = await api({
      variables: { projectOwner: route.params.address },
      query: `
        query ($projectOwner: Bytes!) {
          fundingProjects (where: { projectOwner: $projectOwner }) {
            id
            projectOwner
            daiSplit
            daiCollected
            tokenTypes {
              # tokenTypeId
              streaming
              limit
            }
          }
        }
      `
    })
    projects.value = resp.data.fundingProjects
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => getUsersProjects())
</script>

<template lang="pug">
section.user-projects
  h2.sr-only Projects

  //- p.mx-40.mb-40.border.border-violet-700.rounded-full.text-md.text-violet-650.h-80.flex.items-center.justify-center
    div Incoming funds from <b>Drips</b> form <b>Pools</b>.

  template(v-if="!projects")
    loading-bar

  template(v-else)
    info-bar.justify-center.px-32.mb-20
      div
        template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;#[b raising funds] in <b>{{ projects.length }} {{ projects.length === 1 ? 'community' : 'communities' }}</b>.

    ul
      //- projects...
      li(v-for="project in projects")
        user-project(:project="project", @collected="getUsersProjects")

    footer(v-if="!projects.length")
      .mt-40.flex.justify-center
        router-link.btn.btn-lg.btn-outline.pl-36.pr-28(to="/create") Create a Community ✨

</template>
