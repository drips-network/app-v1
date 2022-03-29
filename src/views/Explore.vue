<script setup>
import { ref, computed, onBeforeMount, toRaw } from 'vue'
import api from '@/api'
import ProjectThumb from '@/components/ProjectThumb.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import DripRow from '@/components/DripRow.vue'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import InfoBar from '@/components/InfoBar.vue'
import HeaderLarge from '@/components/HeaderLarge.vue'
import SpotlightRecipient from '@/components/SpotlightRecipient.vue'
import store from '@/store'
import { formatSplitsEvents, filterForCurrentEvents, toDAIPerMo } from '@/utils'
import content from '../../content/spotlight.js'
import { BigNumber as bn } from 'ethers'

const networkName = JSON.parse(import.meta.env.VITE_APP_CONTRACTS_DEPLOY).NETWORK
const spotlights = content[networkName] || []

const projects = ref()

const projectsSorted = computed(() => {
  return projects.value.slice().sort((a, b) => b.progress - a.progress)
})

const getProjects = async () => {
  try {
    const resp = await api({
      query: `
        query {
          fundingProjects (orderBy: blockTimestampCreated, orderDirection: desc) {
            id
            name: projectName
            created: blockTimestampCreated
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
          dripsConfigs {
            sender: id
            dripsEntries {
              receiver
              amtPerSec
            }
          }
        }
      `
    })
    let configs = resp.data?.dripsConfigs || []

    // filter for has drips
    configs = configs.filter(config => config.dripsEntries.length)

    // TEMP filter out sender=receiver
    // • until resolved: https://github.com/gh0stwheel/drips-subgraph-mainnet-v2/issues/7
    // configs = configs.filter(entry => entry.sender !== entry.receiver)

    // TEMP
    drips.value = []

    // format for rows
    // drips.value = configs.map(config => {
    //   const totalAmtPerSec = config.dripsEntries.reduce((acc, curr) => acc.add(curr.amtPerSec), bn.from(0))
    //   return {
    //     sender: config.sender,
    //     receiver: config.dripsEntries.map(entry => entry.receiver),
    //     amount: toDAIPerMo(totalAmtPerSec)
    //   }
    // })
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
          splitsConfigs (first:50) {
            sender: id
            splitsEntries {
              receiver
              weight
            }
          }
        }
      `
    })
    const configs = resp.data?.splitsConfigs

    // format for rows
    splits.value = configs
      .filter(config => config.splitsEntries.length)
      .map(config => {
        const totalWeight = config.splitsEntries.reduce((acc, curr) => acc.add(curr.weight), bn.from(0))
        return {
          sender: config.sender,
          receiver: config.splitsEntries.map(entry => entry.receiver),
          percent: totalWeight / store.state.splitsFractionMax * 100
        }
      })
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

const updateProjectProgress = (val, i) => {
  if (projects.value[i].progress === undefined) {
    const prjs = projects.value.slice()
    prjs[i].progress = val
    projects.value = prjs
  }
}

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
        li(v-for="(project, i) in projectsSorted")
          project-thumb.mb-32(:project="project", @progress="val => updateProjectProgress(val, i)", :key="project.id")

      footer.mt-56.flex.justify-center
        router-link.btn.btn-lgg.btn-outline.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create-community' }") Create a Community ⛲️

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

</template>
