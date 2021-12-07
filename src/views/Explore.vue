<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumbProgress from '@/components/ProjectThumbProgress'
import LoadingBar from '@/components/LoadingBar'

const projects = ref()

const getProjects = () => {
  return api({
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
}

onBeforeMount(async () => {
  projects.value = (await getProjects()).data.fundingProjects
})
</script>

<template lang="pug">
article.explore.pb-144
  header.pl-1.mt-72.mb-28
    h1.text-4xl.font-semibold.px-32.text-violet-650 Communities

  template(v-if="projects")
    ul
      //- projects...
      li(v-for="project in projects")
        project-thumb-progress.-mb-pxff.my-2(:project="project")

  template(v-else)
    loading-bar
</template>
