<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumbProgress from '@/components/ProjectThumbProgress'

const projects = ref()

const getProjects = () => {
  return api({
    query: `
      query {
        fundingProjects {
          id
          projectOwner
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
    h1.text-4xl.font-semibold.px-32 Explore

  template(v-if="projects")
    ul
      //- projects...
      li(v-for="project in projects")
        project-thumb-progress.-mb-px(:project="project")

  template(v-else)
    p.px-40 Loading...
</template>
