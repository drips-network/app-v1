<script setup>
import { computed, reactive } from 'vue'
import store from '@/store'

const owner = computed(() => store.state.address)

// on-chain project
const project = reactive({
  name: ''
  // owner: address
})

// meta to save to ipfs/pinata
const projectMeta = reactive({
  descrip: ''
  // website: '',
  // twitter: '',
  // discord: ''
})

</script>

<template lang="pug">
article.create
  h1 Create
  form.mx-auto.max-w-sm.text-center.text-blue-500(@submit.prevent, validate)
    section
      div
        input(v-model="project.name", placeholder="name")
      div
        input(v-model="owner", placeholder="owner", disabled)
      div
        input(v-model="projectMeta.descrip", placeholder="description")
      button(type="submit") Save
</template>

<style>
</style>
