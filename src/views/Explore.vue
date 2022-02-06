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
import { formatSplitsEvents, filterForCurrentEvents, toDAIPerMo } from '@/utils'
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
              currentTotalAmtPerSec
              currentTotalGiven
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
    // fetch from api...
    const resp = await api({
      query: `
        query {
          dripsEntries {
            # id
            receiver
            sender: user
            amtPerSec
          }
        }
      `
    })
    let entries = resp.data?.dripsEntries || []

    // TEMP filter out sender=receiver
    // • until resolved: https://github.com/gh0stwheel/drips-subgraph-mainnet-v2/issues/7
    entries = entries.filter(entry => entry.sender !== entry.receiver)

    // format for rows
    drips.value = entries.map(entry => ({
      sender: entry.sender,
      receiver: [entry.receiver],
      amount: toDAIPerMo(entry.amtPerSec)
    }))
  } catch (e) {
    drips.value = []
  }
}

const splits = ref()
const getSplits = async () => {
  try {
    // fetch from api...
    const resp = await api({
      query: `
        query {
          splitsEntries (first:40) {
            # id
            receiver
            sender
            weight
          }
        }
      `
    })
    const entries = resp.data?.splitsEntries
    console.log(entries)
    // format for rows
    splits.value = entries.map(entry => ({
      sender: entry.sender,
      receiver: [entry.receiver],
      percent: entry.weight / store.state.splitsFractionMax * 100
    }))
  } catch (e) {
    splits.value = []
  }
}

const dripRows = computed(() => {
  if (!splits.value && !drips.value) return null
  const splitsRows = splits.value || []
  const dripsRows = drips.value || []
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

  //- (spotlight)
  section.mb-240(v-if="spotlights.length")
    header-large.mb-96(icon="✨")
      header
        h2.font-semibold Spotlight

    section
      //- spotlights...
      spotlight-recipient(v-for="spotlight in spotlights", :spotlight="spotlight", :allSplits="splits")

  //- drips
  section.mt-24.mb-220
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
        router-link.btn.btn-lgg.btn-outline.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create' }") Create a Drip 💧

  //- communities
  section.mt-24.mb-220
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
        router-link.btn.btn-lgg.btn-outline.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create-community' }") Create a Community ⛲️

</template>
