<script setup>
// import UserProject from '@/components/UserProject.vue'
// import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
// import api from '@/api'
// import InfoBar from '@/components/InfoBar.vue'
import Addr from '@/components/Addr.vue'
// import LoadingBar from '@/components/LoadingBar.vue'
import ProjectDetail from '@/components/ProjectDetail.vue'

const route = useRoute()
const props = defineProps(['projects'])
const emit = defineEmits(['collected'])

</script>

<template lang="pug">
section.user-projects
  header.my-80.flex
    h2.sr-only Memberships
    p.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms(:class="{'animate-pulse': !props.projects}")
      div
        template(v-if="!props.projects")
          | Loading...
        template(v-else)
          | #[addr.font-bold(:address="$route.params.address")] is raising funds with 🧧 #[b NFT Memberships] 

  .flex.flex-wrap.justify-evenly(v-if="props.projects && props.projects.length")
    //- projects...
    template(v-for="project in props.projects")
      //- user-project(:project="project", @collected="getProjects")
      project-detail(:project="project", @collected="$emit('collected')")

//- section.user-projects
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
        router-link.btn.btn-lg.btn-outline.pl-36.pr-28(to="/create") Create a Community ⛲️

</template>
