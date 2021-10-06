<script setup>
import { computed, reactive } from 'vue'
// import { useRouter } from 'vue-router'
import store from '@/store'

const state = reactive({
  // status: null,
  tx: null,
  projectAddress: null,
  projectIpfsHash: null
})

const owner = computed(() => store.state.address)

// on-chain project
const project = reactive({
  name: '',
  symbol: '',
  minAmount: 0
})

// meta to save to ipfs/pinata
const projectMeta = reactive({
  descrip: ''
  // website: '',
  // twitter: '',
  // discord: ''
})

async function submit () {
  try {
    project.owner = owner.value

    // send!
    const resp = await store.dispatch('createProject', { project, projectMeta })
    console.log(resp)
    state.tx = resp.tx
    state.projectIpfsHash = resp.ipfsHash

    // confirmation...
    state.projectAddress = await store.dispatch('waitForProjectCreate', { txFrom: state.tx.from })
  } catch (e) {
    state.tx = null
  }
}
</script>

<template lang="pug">
article.create
  h1 Create
  .mx-auto.max-w-sm.text-center
    form.text-blue-500(@submit.prevent="submit", validate)
      section
        div
          input(v-model="project.name", placeholder="name", required)
        div
          input(v-model="project.symbol", placeholder="symbol", required)
        div
          input(v-model="owner", placeholder="owner", disabled)
        div
          textarea(v-model="projectMeta.descrip", placeholder="description")
        //- div
          label Min Amount
          input(v-model="project.minAmount", type="number", required)

        div
          button(type="submit") Create

    .mt-4(v-if="state.tx")
      a(:href="`https://rinkeby.etherscan.io/tx/${state.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

    .mt-4(v-if="state.projectAddress")
      router-link(:to="{name: 'project', params: { address: state.projectAddress }, query: { ipfs: state.projectIpfsHash }}") View Project

  div
    button(@click="$store.dispatch('getEventLog')") Log Projects in Console...

</template>

<style>
</style>
