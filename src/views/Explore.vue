<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumbProgress from '@/components/ProjectThumbProgress'
import LoadingBar from '@/components/LoadingBar'

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
article.explore.pb-144
  header.pl-1.mt-72.mb-28
    h1.text-4xl.font-semibold.px-32.text-violet-650 Communities

  section(v-if="projects")
    ul
      //- projects...
      li(v-for="project in projects")
        project-thumb-progress.-mb-pxff.my-2(:project="project")

    footer.mt-56.flex.justify-center
      router-link.btn.btn-xl.btn-dark.px-60(to="/create") Create ✨

  loading-bar(v-else)
</template>
