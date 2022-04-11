<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import ProjectDetail from '@/components/ProjectDetail.vue'
import UserTagSmall from '@/components/UserTagSmall.vue'
import Addr from "@/components/Addr.vue"
import UserAvatar from '@/components/UserAvatar.vue'

const route = useRoute()
const projectAddress = route.params.address
const project = ref()
const status = ref()

let projectRequests = 0
const getProject = async (showLoading) => {
  try {
    if (showLoading) {
      status.value = 'Loading...'
    }

    // get project...
    project.value = await store.dispatch('getProject', projectAddress)

    // !! not found
    if (!project.value) {
      status.value = "Membership doesn't exist :/"
      return false
    }

    // missing info?
    if (!project.value.projectOwner) {
      // project likely just created and not in API yet
      // retry every 1s with a max

      if (projectRequests < 22) {
        console.log('project not found in API yet, refetching in 1s...')
        projectRequests++
        return setTimeout(() => getProject(), 1000)
      }

      // give up
      throw new Error("Couldn't find membership. Refresh if recently created.")
    }

    status.value = null
  } catch (e) {
    // console.error(e)
    status.value = e.message || 'Error'
  }
}

onBeforeMount(() => getProject(true))
</script>

<template lang="pug">
article.project-2.pt-40.pb-80

  //- (loading status)
  template(v-if="status")
    .flex.justify-center
      .h-80.px-40.rounded-full.bg-indigo-950.font-semibold.text-violet-650.flex.items-center.justify-center.text-md(:class="{'animate-pulse': status.includes('...') }")
        | {{ status }}
  
  //- (project)
  template(v-else)
    header
      h1.sr-only {{ project.name }} Membership

      //- summary
      p.flex.justify-center.mt-36ff.mb-72
        .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-6.pr-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semibold
          router-link.flex.items-center.rounded-full.pl-4.pr-1.py-4.notouch_hover_violet-600.notouch_hover_text-white.mr-5(:to="{name: 'user', params: { address: project.projectOwner }}")
            user-avatar.w-24.h-24.mr-8(:address="project.projectOwner")
            addr.font-boldff(:address="project.projectOwner")
          div is raising funds in an #[b 🧧 NFT Membership] 
    
    //- detail
    section.flex.justify-center
      project-detail(:project="project", @collected="getProject", :ownerVisible="true", @refresh="getProject")
    
</template>