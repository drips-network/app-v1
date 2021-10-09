<script setup>
import { computed, reactive } from 'vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
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
  // owner added in dispatch action
  symbol: '',
  ipfsHash: ''
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
  form(@submit.prevent="submit", validate)
    panel(icon="✨")
      template(v-slot:header)
        h2 Project
      section
        template(v-if="owner")
          //- .my-10
            input-body(label="Owner", :isFilled="owner.length", format="code")
              input(v-model="owner", placeholder="owner", disabled)
          .my-10
            input-body(label="Name*", :isFilled="project.name.length")
              input(v-model="project.name", placeholder="Name*", required)
          .my-10
            input-body(label="Symbol*", :isFilled="project.name.length")
              input(v-model="project.symbol", placeholder="Symbol*", required)
          .my-10
            input-body(label="Description", :isFilled="projectMeta.descrip.length")
              textarea(v-model="projectMeta.descrip", placeholder="Description")
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
