<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectThumb from '@/components/ProjectThumb'
import LoadingBar from '@/components/LoadingBar'
import DripRow from '@/components/DripRow'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
import DripsAll from '@/components/DripsAll'
import InfoBar from '@/components/InfoBar'
import HeaderLarge from '@/components/HeaderLarge'
import SpotlightRecipient from '@/components/SpotlightRecipient'
import store from '@/store'

const spotlights = [
  // soliditylang.eth
  { address: '0x151ef20a3ade1cc1161391594f8a32461389a54e', highlight: 'sender' }, 
  // ricmoo.eth
  { address: '0x5555763613a12d8f3e73be831dff8598089d3dca', highlight: 'receiver' },
  // walletconnect.eth 
  { address: '0xcbec15583a21c3ddad5fab658be5b4fe85df730b', highlight: 'receiver' }, 
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
  //- header.flex.mt-12
    h1.h-80.rounded-full.flex.border.border-violet-600.ffbg-indigo-700.text-2xl.font-semibold.items-center.px-28.text-violet-650 Explore
  //- featured
  section
    //- h2.sr-only Highlights
    header-large(icon="✨")
      header
        h2 Spotlight

    section
      //- spotlights...
      spotlight-recipient(v-for="spotlight in spotlights", :spotlight="spotlight", :allSplits="splits")
          
          

  //- communities
  section.mt-240
    //- header-large.mb-96(icon="🙂")
      h2 Communities
    //- .flex.justify-center
      .h-80.bg-indigo-950.borderff.border-violet-800.pr-40.text-xl.rounded-full.flex.items-center.text-violet-650.font-semibold
        .ml-32.mr-16 🙂
        | Communities

    section.mt-56
      template(v-if="!projects")
        loading-bar

      template(v-else)
        section.px-12ff
          .w-full.mb-60.flex.justify-center.stickyff.z-20.top-6
            .flex.bg-indigo-950.borderff.border-violet-700.rounded-full.items-center
              .h-44.w-44.flex.items-center.justify-center.text-base 🙂
              .-ml-6.text-base.font-semibolffd.pr-20.text-violet-650
                | #[b Communities] raising funds with #[b NFT memberships] 🧩
          //- info-bar.mb-16.text-md
            .w-full.text-center.px-32
              | These #[b communities] are raising funds with #[b NFT memberships] 🧩

          //- .my-40.text-base.text-violet-650.text-center
            | #[b {{ projects.length }} communities] are #[b raising funds] with #[b NFT memberships] 🧩

          ul
            //- projects...
            li(v-for="project in projects")
              project-thumb.mb-32(:project="project")

          //- footer.mt-56.flex.justify-center
            router-link.btn.btn-xl.btn-dark.px-60(to="/create") Create ✨

  //- drips
  section.mt-220
    //- header-large.mb-96(icon="💧")
      h2 Drips

    section.mt-48.pb-40
      drips-all.text-lg(:splits="splits")
</template>
