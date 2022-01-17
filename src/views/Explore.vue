<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumb from '@/components/ProjectThumb'
import LoadingBar from '@/components/LoadingBar'
import DripRow from '@/components/DripRow'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
// import DripsAll from '@/components/DripsAll'
import InfoBar from '@/components/InfoBar'
import HeaderLarge from '@/components/HeaderLarge'
import SpotlightRecipient from '@/components/SpotlightRecipient'
import store from '@/store'
import { formatSplitsEvents } from '@/utils'

const spotlights = [
  // soliditylang.eth
  { address: '0x151ef20a3ade1cc1161391594f8a32461389a54e', highlight: 'sender' },
  // ricmoo.eth
  { address: '0x5555763613a12d8f3e73be831dff8598089d3dca', highlight: 'receiver' },
  // walletconnect.eth
  { address: '0xcbec15583a21c3ddad5fab658be5b4fe85df730b', highlight: 'receiver' }
]

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

const splits = ref()
const dripRows = computed(() => splits.value && formatSplitsEvents(splits.value))
const getSplits = async () => {
  try {
    const events = await store.dispatch('getSplitsReceivers')
    // reduce by address (current state)
    const currentEvents = []
    events.reverse()
      .filter(event => event.args[1].length)
      .forEach(event => {
        if (!currentEvents.find(e => e.args[0] === event.args[0])) {
          currentEvents.push(event)
        }
      })

    splits.value = currentEvents
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => {
  getProjects()
  getSplits()
})
</script>

<template lang="pug">
article.explore.pt-56.px-24
  section
    header-large.mb-96(icon="✨")
      header
        h2 Spotlight

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
      header-large.mb-56(icon="🙂")
        header
          h2 #[b Communities] raising funds with #[b NFT memberships] 🧩

      ul
        //- projects...
        li(v-for="project in projects")
          project-thumb.mb-32(:project="project")

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
</template>
