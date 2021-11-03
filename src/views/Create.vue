<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...

// TODO - auto-update when re-editing areas? Or change button to "SAVE" in each panel??

import { ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateProjectPanel from '@/components/CreateProjectPanel'
import CreateProjectFundingPanel from '@/components/CreateProjectFundingPanel'
import CreateMembershipsPanel from '@/components/CreateMembershipsPanel'
import CreateDripsPanel from '@/components/CreateDripsPanel'
import store from '@/store'

const route = useRoute()
const router = useRouter()

const project = ref(null)
const projectAddress = ref(null)
const tx = ref()

const onProjectMetaUpdated = (body) => {
  project.value = body
  console.log('project updated', toRaw(project.value))
}

const onFundingUpdated = ({ goal, nftType }) => {
  project.value.goal = goal // DAI
  project.value.inputNFTTypes = []
  project.value.inputNFTTypes.push(nftType)
  console.log('project funding updated', toRaw(project.value))
}

const onMembershipsUpdated = (memberships) => {
  project.value.memberships = memberships
  console.log('memberships updated', toRaw(project.value))
}

async function submitProject () {
  try {
    tx.value = await store.dispatch('createProject', project.value)
    console.log('tx', tx.value)

    // on project created...
    projectAddress.value = await store.dispatch('waitForProjectCreate', tx.value)

    // go to project
    // router.push({ name: 'project', params: { address } })
  } catch (e) {
    console.error(e)
  }
}

const viewBtnVisible = ref(false)
const showViewBtn = () => { viewBtnVisible.value = true }

// preloaded address? (dev)
// const projectAddress = ref(route.query.project)

// const onProjectCreated = (address) => {
//   projectAddress = address
// }

const isDev = process.env.NODE_ENV !== 'production'
projectAddress.value = isDev ? route.query.project : null
</script>

<template lang="pug">
article.create.py-80.relative
  //- create project sections
  section(:class="{'opacity-50': projectAddress}")
    create-project-panel(@projectMetaUpdated="onProjectMetaUpdated")

    create-project-funding-panel.my-24(v-if="project", @fundingUpdated="onFundingUpdated")

    create-memberships-panel.my-24(v-if="project && project.inputNFTTypes", @updated="onMembershipsUpdated")

    .mt-40.flex.justify-center.w-full(v-if="project && project.memberships && !projectAddress")
      .text-center
        button.btn.btn-xl.btn-white.min-w-md(@click="submitProject")
          template(v-if="tx") Creating...
          template(v-else) Create ✨

        //- (tx link)
        .mt-16.text-violet-600(v-if="tx")
          a(:href="`https://rinkeby.etherscan.io/tx/${tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

  //- post-create
  section(v-if="projectAddress")
    //- (add drips after project creation)
    create-drips-panel.my-24(:projectAddress="projectAddress", @skip="showViewBtn", @dripsAdded="showViewBtn")

    //- (view link)
    .mt-40.flex.justify-center(v-show="viewBtnVisible")
      router-link.btn.btn-lg.btn-white.min-w-sm(:to="{name: 'project', params: { address: projectAddress }}") View Project

  button.absolute.bottom-0.left-0.p-8.text-violet-600.text-sm(v-show="isDev", @click="$store.dispatch('getEventLog')") Log project events...
</template>

<style>
</style>
