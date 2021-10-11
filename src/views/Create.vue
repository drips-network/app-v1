<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateProjectPanel from '@/components/CreateProjectPanel'
import CreateProjectFundingPanel from '@/components/CreateProjectFundingPanel'

const route = useRoute()
const router = useRouter()

const state = reactive({
  projectAddress: route.query.project
})

const onProjectCreated = (address) => {
  state.projectAddress = address
}

const onAddedNFTType = () => {
  // redirect to project page
  setTimeout(() => {
    router.push({ name: 'project', params: { address: state.projectAddress } })
  }, 1000)
}

const isDev = process.env.NODE_ENV !== 'production'
</script>

<template lang="pug">
article.create.py-80.relative
  create-project-panel(@projectCreated="onProjectCreated")

  create-project-funding-panel.my-24(v-if="state.projectAddress", :projectAddress="state.projectAddress", @addedNFTType="onAddedNFTType")

  button.absolute.bottom-0.left-0.p-8.text-violet-600.text-sm(v-show="isDev", @click="$store.dispatch('getEventLog')") Log project events...
</template>

<style>
</style>
