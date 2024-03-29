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
import ProjectDetail from '@/components/ProjectDetail.vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import store from '@/store'
import { formatSplitsEvents, filterForCurrentEvents, toDAIPerMo, toDAI, oneMonth } from '@/utils'
import content from '../../content/spotlight.js'
import { BigNumber as bn } from 'ethers'

const networkName = JSON.parse(import.meta.env.VITE_APP_CONTRACTS_DEPLOY).NETWORK
const spotlights = content[networkName] || []

// projects
const projects = ref()
const showAllProjects = ref(false)

const projectsFiltered = computed(() => {
  if (!showAllProjects.value) {
    // limit to 4 projects
    return projects.value.slice(0, 4)
  }
  return projects.value
  // return projects.value //.slice().sort((a, b) => b.progress - a.progress)
})

const projectOwnersCount = computed(() => {
  const owners = projects.value?.map(prj => prj.projectOwner) || []
  return [...new Set(owners)].length // ES6 de-dupe
})

const getProjects = async () => {
  try {
    // hidden projects?
    let excludeIds = import.meta.env.VITE_APP_EXCLUDE_PROJECTS?.split(',')
    excludeIds = excludeIds ? `id_not_in: ${JSON.stringify(excludeIds)}` : ''
    
    const resp = await api({
      query: `
        query {
          fundingProjects (orderBy: blockTimestampCreated, orderDirection: desc, where: { ${excludeIds} }) {
            id
            timestamp: blockTimestampCreated
            projectOwner
            daiCollected
            daiSplit
            ipfsHash
            tokenTypes {
              tokenTypeId
              id
              minAmt: minAmtPerSec
              limit
              currentTotalAmtPerSec
              currentTotalGiven
              ipfsHash
              streaming
            }
            tokens {
              owner: tokenReceiver
            }
          }
        }
      `
    })
    let prjs = resp.data?.fundingProjects || []
    // filter some out with bad data
    prjs = prjs.filter(node => node.tokenTypes.length)
    // set
    projects.value = prjs
  } catch (e) {
    console.error(e)
  }
}

// drips/splits
const showAllDrips = ref(false)

const drips = ref()
const getDrips = async () => {
  try {
    // fetch from api...
    const resp = await api({
      query: `
        query {
          dripsConfigs {
            timestamp: lastUpdatedBlockTimestamp
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

    // filter for has drips, min amt
    configs = configs
      .filter(config => {
        // filter-out empty configs, and strange sender === receiver
        if (!config.dripsEntries.length || config.sender === config.dripsEntries[0]?.receiver) {
          return false
        }
        // only min amt
        const minMoAmt = "4990000000000000000" // 4.99 DAI
        const totalAmtPerSec = config.dripsEntries.reduce((acc, curr) => acc.add(curr.amtPerSec), bn.from(0))
        return totalAmtPerSec.mul(oneMonth).gte(minMoAmt)
      })

    // format for rows
    configs = configs
      .map(config => {
        const totalAmtPerSec = config.dripsEntries.reduce((acc, curr) => acc.add(curr.amtPerSec), bn.from(0))
        return {
          sender: config.sender,
          receiver: config.dripsEntries.map(entry => entry.receiver),
          amount: toDAIPerMo(totalAmtPerSec),
          timestamp: config.timestamp
        }
      })

    drips.value = configs
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
          splitsConfigs (first:200, orderBy: lastUpdatedBlockTimestamp, orderDirection: desc) {
            sender: id
            timestamp: lastUpdatedBlockTimestamp
            splitsEntries {
              receiver
              weight
            }
          }
        }
      `
    })
    const configs = resp.data?.splitsConfigs

    // format for UserDripsDetail.vue
    // const rows = configs
    //   .filter(config => config.splitsEntries.length)
    //   .map(config => {
    //     return {
    //       sender: config.sender,
    //       // for DripsListExpands.vue
    //       drips: config.splitsEntries.map(split => ({
    //         sender: config.sender,
    //         receiver: [split.receiver],
    //         percent: split.weight / store.state.splitsFractionMax * 100
    //       }))
    //     }
    //   })

    // format for DripRow.vue
    const rows = configs
      .filter(config => config.splitsEntries.length)
      .map(config => {
        const totalWeight = config.splitsEntries.reduce((acc, curr) => acc.add(curr.weight), bn.from(0))
        return {
          sender: config.sender,
          receiver: config.splitsEntries.map(entry => entry.receiver),
          percent: totalWeight / store.state.splitsFractionMax * 100,
          timestamp: config.timestamp
        }
      })

    splits.value = rows
  } catch (e) {
    splits.value = []
  }
}

// get gives 
const gives = ref()
const getGives = async () => {
  try {
    // min amount? 
    const minGiveAmt = "1000000000000000000000" // 1000 DAI
    
    const resp = await api({
      query:`
        query getGives {
          gives (orderBy: blockTimestampGiven, orderDirection: desc, where: { amount_gte: "${minGiveAmt}" }) {
            id
            sender 
            receiver
            amount
            timestamp: blockTimestampGiven
          }
        }
      `
    })
    const entries = resp.data?.gives

    // format for DripRow.vue
    const rows = entries.map(entry => ({
      sender: entry.sender,
      receiver: [entry.receiver],
      timestamp: entry.timestamp,
      give: toDAI(entry.amount)
    }))

    gives.value = rows
  } catch (e) {
    gives.value = []
  }
}

const dripRows = computed(() => {
  // loading...
  if (!splits.value && !drips.value && !gives.value) return null

  const splitsRows = splits.value || []
  const dripsRows = drips.value || []
  const givesRows = gives.value || []
  const rows = [...dripsRows, ...splitsRows, ...givesRows]
  // sort by time
  rows.sort((a, b) => b.timestamp - a.timestamp)
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
  getGives()
})
</script>

<template lang="pug">
article.explore

  //- (spotlight)
  section.mt-56(v-if="spotlights.length")
    header-large.mb-96(icon="✨")
      header
        h2.font-semibold Spotlight

    section
      //- spotlights...
      spotlight-recipient(v-for="spotlight in spotlights", :spotlight="spotlight", :allSplits="splits")

    //- wave divider
    .mt-24.mb-56
      .bg-img-wave-shadow-violet

  //- drips
  section.mb-144
    header.flex.justify-center.pt-56
      h2.h-80.font-semibold.bg-indigo-700.flex.items-center.rounded-full.text-violet-650.px-22
        .h-36.w-36.flex.items-center.justify-center.text-lgg.-ml-2 💧
        .text-xl.ml-12 Drips
        .h-40.min-w-40.ml-16.rounded-full.bg-indigo-900.flex.items-center.justify-center.text-white.text-base(:class="{'animate-pulse': !dripRows}")
          template(v-if="dripRows")
            | {{ dripRows.length }}
    
    //- (loading)
    template(v-if="!projects")
      .flex.justify-center.mt-60
        .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.px-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semibold.animate-pulse
          span Loading...

    //- (list)
    template(v-else)
      //- small text summary
      p.flex.justify-center.mt-60
        .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.px-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semibold
          div Big drips around the network!
          //- #[b {{ projectOwnersCount }} addresses] are raising funds with #[b NFT Memberships]

      //- header-large.mb-56(icon="💧")
        header
          h2 #[b {{ dripRows.length }} address] are #[b dripping] to others.

      //- drips...
      section.mt-60.px-36
        ul
          li(v-for="(drip, i) in dripRows")
            template(v-if="showAllDrips || i <= 12")
              drip-row.mb-112.md_my-4(:drip="drip")
            //- user-drips-detail(:config="config")

      //- (show all btn)
      footer
        .flex.justify-center.mt-36(v-if="dripRows.length > 12")
          button.btn-mdd.rounded-full.btn-darkest.text-violet-650.pl-26.pr-12.font-semibold.text-lg(@click="showAllDrips = !showAllDrips")
            .flex.items-center
              div {{ showAllDrips ? 'View Less' : `View All ${ dripRows.length }` }}
              svg-chevron-down.h-36.w-36.ml-4(:class="{'transform origin-center rotate-180': showAllDrips}")

        .mt-120.flex.justify-center
          router-link.btn.btn-lgg.btn-outline.pl-48.pr-40.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create' }") Make a Drip 💧


  //- memberships
  section.mt-24.mb-144
    //- wave divider
    .bg-img-wave-shadow-violet

    header.flex.justify-center.mt-56.pt-56
        h2.h-80.font-semibold.bg-indigo-700.flex.items-center.rounded-full.text-violet-650.px-22
          .h-36.w-36.flex.items-center.justify-center.text-lgg.-ml-2 🧧
          .text-xl.ml-12 Memberships
          .h-40.min-w-40.ml-16.rounded-full.bg-indigo-900.flex.items-center.justify-center.text-white.text-base(:class="{'animate-pulse': !projects}")
            template(v-if="projects")
              | {{ projects.length }}

    //- (loading)
    template(v-if="!projects")
      .flex.justify-center.mt-60
        .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.px-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semibold.animate-pulse
          span Loading...

    //- (list)
    template(v-else)
      //- small text summary
      p.flex.justify-center.mt-60
        .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.px-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semiboldff
          div #[b {{ projectOwnersCount }} addresses] are raising funds with #[b NFT Memberships]
      
      //- memberships list
      .mt-72.flex.flex-wrap.justify-evenly
        //- projects...
        template(v-for="(project, i) in projectsFiltered")
          project-detail.mb-132(:project="project", :ownerVisible="true")

      //- (show all btn)
      footer
        .flex.justify-center.-mt-40(v-if="projects.length > 2")
          button.btn-mdd.rounded-full.btn-darkest.text-violet-650.pl-26.pr-12.font-semibold.text-lg(@click="showAllProjects = !showAllProjects")
            .flex.items-center
              div {{ showAllProjects ? 'View Less' : 'View All' }}
              svg-chevron-down.h-36.w-36.ml-4(:class="{'transform origin-center rotate-180': showAllProjects}")
        
        .mt-120.flex.justify-center
          router-link.btn.btn-lgg.btn-outline.pl-40.pr-36.transform.notouch_hover_scale-102.transition.duration-150(:to="{name: 'create-community' }") Create a Membership 🧧


</template>
