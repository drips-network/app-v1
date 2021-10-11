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

const emit = defineEmits(['projectCreated'])

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
    emit('projectCreated', state.projectAddress)
  } catch (e) {
    state.tx = null
  }
}
</script>

<template lang="pug">
panel.mx-auto(icon="✨")
  template(v-slot:header)
    h2 Project
  section
    //- (connect bt)
    template(v-if="!owner")
      button.btn.btn-lg.btn-white.mx-auto(@click="$store.dispatch('connect')") Connect Wallet

    //- (create form)
    template(v-else)
      form(@submit.prevent="submit", validate)
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
            input(v-model="projectMeta.descrip", placeholder="Description")

        div.mt-40
          //- create btn
          button.btn.btn-lg.btn-white.mx-auto(type="submit", :disabled="state.tx !== null")
            template(v-if="state.projectAddress") Created!
            template(v-else-if="state.tx") Creating...
            template(v-else) Create

          //- (tx link)
          .mt-16.text-violet-600(v-if="state.tx")
            a(:href="`https://rinkeby.etherscan.io/tx/${state.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

//- .mt-4(v-if="state.projectAddress")
  router-link(:to="{name: 'project', params: { address: state.projectAddress }}") View Project

//- div
  button(@click="$store.dispatch('getEventLog')") Log Projects in Console...

</template>

<style>
</style>
