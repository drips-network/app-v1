<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumb from '@/components/ProjectThumb'
import LoadingBar from '@/components/LoadingBar'
import DripRow from '@/components/DripRow'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
import InfoBar from '@/components/InfoBar'
import HeaderLarge from '@/components/HeaderLarge'
import SpotlightRecipient from '@/components/SpotlightRecipient'
import store from '@/store'
import { formatSplitsEvents, formatDripsEvents, filterForCurrentEvents } from '@/utils'
import content from '../../content/spotlight.js'

const networkName = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY).NETWORK
const spotlights = content[networkName] || []

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
            tokens (first: 5) {
              owner: tokenReceiver
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

const drips = ref()
const getDrips = async () => {
  try {
    const events = await store.dispatch('getDripsReceivers')
    drips.value = filterForCurrentEvents(events).filter(event => event.args[2].length)
    console.log(drips.value)
  } catch (e) {
    drips.value = []
  }
}

const splits = ref()
const getSplits = async () => {
  try {
    const events = await store.dispatch('getSplitsReceivers')
    splits.value = filterForCurrentEvents(events).filter(event => event.args[1].length)
  } catch (e) {
    splits.value = []
  }
}

const dripRows = computed(() => {
  if (!splits.value && !drips.value) return null
  const splitsRows = splits.value ? formatSplitsEvents(splits.value) : []
  const dripsRows = drips.value ? formatDripsEvents(drips.value) : []
  const rows = [...dripsRows, ...splitsRows]
  rows.sort((a, b) => b.blockNumber - a.blockNumber)
  return rows
})

onBeforeMount(() => {
  getProjects()
  getSplits()
  getDrips()
})
</script>

<template lang="pug">
article.explore.pt-56.px-24
  section
    header-large.mb-96(icon="✨")
      header
        h2.font-semibold Spotlight

    section
      //- spotlights...
      spotlight-recipient(v-for="spotlight in spotlights", :spotlight="spotlight", :allSplits="splits")

  //- communities
  section.mt-240
    //- (loading)
    template(v-if="!projects")
      loading-bar

    //- (list)
    template(v-else)
      header-large.mb-56(icon="⛲️")
        header
          h2 #[b Communities] are raising funds with #[b NFT memberships] 🧩

      ul
        //- projects...
        li(v-for="project in projects")
          project-thumb.mb-32(:project="project")

      footer.mt-56.flex.justify-center
        router-link.btn.btn-lgg.btn-outline.bg-indigo-950.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create-community' }") Create a Community ⛲️

  //- drips
  section.mt-220
    //- (loading)
    template(v-if="!splits")
      loading-bar

    //- (list)
    template(v-else)
      header-large.mb-56(icon="💧")
        header
          h2 #[b {{ dripRows.length }} address] are #[b dripping] to others.

      section
        ul
          li(v-for="drip in dripRows")
            drip-row.my-4(:drip="drip")

      footer.mt-56.flex.justify-center
        router-link.btn.btn-lgg.btn-outline.bg-indigo-950.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create' }") Create a Drip 💧
</template>
