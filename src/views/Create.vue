<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...
import { ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateProjectPanel from '@/components/CreateProjectPanel'
import CreateProjectFundingPanel from '@/components/CreateProjectFundingPanel'
import store from '@/store'

const route = useRoute()
const router = useRouter()

const project = ref(null)
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

async function submitProject () {
  try {
    tx.value = await store.dispatch('createProject', project.value)
    console.log('tx', tx)

    // on project created...
    const address = await store.dispatch('waitForProjectCreate', tx.value)

    router.push({ name: 'project', params: { address } })
  } catch (e) {
    console.error(e)
  }
}

// preloaded address? (dev)
// const projectAddress = ref(route.query.project)

// const onProjectCreated = (address) => {
//   projectAddress = address
// }

const isDev = process.env.NODE_ENV !== 'production'
</script>

<template lang="pug">
article.create.py-80.relative
  create-project-panel(@projectMetaUpdated="onProjectMetaUpdated")

  create-project-funding-panel.my-24(v-if="project", @fundingUpdated="onFundingUpdated")

  .mt-40.flex.justify-center.w-full(v-if="project && project.inputNFTTypes")
    .text-center
      button.btn.btn-xl.btn-white.min-w-md(@click="submitProject")
        template(v-if="tx") Creating...
        template(v-else) Create ✨

      //- (tx link)
      .mt-16.text-violet-600(v-if="tx")
        a(:href="`https://rinkeby.etherscan.io/tx/${tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

  button.absolute.bottom-0.left-0.p-8.text-violet-600.text-sm(v-show="isDev", @click="$store.dispatch('getEventLog')") Log project events...
</template>

<style>
</style>
