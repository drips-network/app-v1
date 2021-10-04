<script setup>
import { computed, reactive } from 'vue'
import store from '@/store'

const owner = computed(() => store.state.address)

// on-chain project
const project = reactive({
  name: '',
  symbol: '',
  minAmount: 0
  // owner: address
})

// meta to save to ipfs/pinata
const projectMeta = reactive({
  descrip: ''
  // website: '',
  // twitter: '',
  // discord: ''
})

function submit () {
  store.dispatch('newProject', project)
}

</script>

<template lang="pug">
article.create
  h1 Create
  form.mx-auto.max-w-sm.text-center.text-blue-500(@submit.prevent, validate)
    section
      div
        input(v-model="project.name", placeholder="name", required)
      div
        input(v-model="project.symbol", placeholder="symbol", required)
      div
        input(v-model="owner", placeholder="owner", disabled)
      //- div
        input(v-model="projectMeta.descrip", placeholder="description")
      div
        label Min Amount
        input(v-model="project.minAmount", type="number", required)

      div
        button(type="submit", @click="submit") Save

  div
    button(@click="$store.dispatch('getEventLog')") Log...

</template>

<style>
</style>
