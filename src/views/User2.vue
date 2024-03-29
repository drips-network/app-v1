<script setup>
import { ref, computed, watch, onMounted, provide, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserTag from '@/components/UserTag.vue'
import Addr from '@/components/Addr.vue'
import AddressesTag from '@/components/AddressesTag.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import UserProject from '@/components/UserProject.vue'
import UserNft from '@/components/UserNFT.vue'
import IconSplit from '@/components/IconSplit.vue'
import ModalDripTo from '@/components/ModalDripTo.vue'
import ModalCollectDrips from '@/components/ModalCollectDrips.vue'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect.vue'
import ModalDripsEdit from '@/components/ModalDripsEdit.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import ModalEditProfile from '@/components/ModalEditProfile.vue'
import SvgDai from '@/components/SvgDai.vue'
import SvgPen from '@/components/SvgPen.vue'
import SvgArrowRight from '@/components/SvgArrowRight.vue'
import ProjectDetail from '@/components/ProjectDetail.vue'
import DripsListExpands from '@/components/DripsListExpands.vue'
import SvgX from '@/components/SvgX.vue'
import store from '@/store'
import { utils } from 'ethers'
import { toDAI, toDAIPerMo, formatSplitsEvents } from '@/utils'
import api, { queryGivesByReceiver, queryGivesBySender } from '@/api'

const route = useRoute()
const router = useRouter()
const ensName = computed(() => store.state.addresses[route.params.address]?.ens)
const profileMeta = ref()
const dripModalOpen = ref(false)
const collectModalOpen = ref(false)
const showAllMemberships = ref(false)
const showAllNFTs = ref(false)
const waveBgImgUrl = new URL('../assets/wave-shadow-violet.svg', import.meta.url).href

// my account
const isMyUser = computed(() => store.state.address === route.params.address)
const editDripsSelect = ref(false)
const edit = ref(null) // 'drips' | 'splits' | 'profile'
const collectableAmts = ref()
const collectableTotal = computed(() => {
  return !collectableAmts.value ? -1
    : toDAI(collectableAmts.value[0].add(collectableAmts.value[1]))
})

const getMyCollectable = () => {
  store.dispatch('getCollectable', { address: route.params.address })
    .then(amts => { collectableAmts.value = amts })
    .catch(console.error)
}

// drips in
const splitsIn = ref()
const dripsIn = ref()
const givesIn = ref()

const allDripsIn = computed(() => {
  if (!dripsIn.value && !splitsIn.value && !givesIn.value) {
    return undefined // "loading"
  }
  const dIn = dripsIn.value || []
  const sIn = splitsIn.value || []
  const gIn = givesIn.value || []
  // TODO sort (add timestamps to drips + splits)
  return [...dIn, ...sIn, ...gIn] //.sort((a, b) => a.timestamp - b.timestamp)
})

const allSenders = computed(() => {
  return allDripsIn.value?.map(d => d.sender)
})
  
// get splits In
const getSplitsIn = async () => {
  try {
    const splits = await store.dispatch('getSplitsByReceiver', route.params.address)
    // format + save
    splitsIn.value = splits.map(split => ({
      ...split,
      receiver: [split.receiver]
    }))
  } catch (e) {
    console.error(e)
    splitsIn.value = []
  }
}

// get drips In
const getDripsIn = async () => {
  try {
    const entries = await store.dispatch('getDripsByReceiver', route.params.address)
    // format + save
    dripsIn.value = entries.map(drip => ({
      ...drip,
      receiver: [drip.receiver], // [drip[0]],
      amount: toDAIPerMo(drip.amtPerSec), // toDAIPerMo(drip[1])
      amtPerSec: drip.amtPerSec,
    }))
  } catch (e) {
    console.error(e)
    dripsIn.value = []
  }
}

// get gives in
const getGivesIn = async () => {
  try {
    const resp = await api({ query: queryGivesByReceiver, variables: { address: route.params.address }})
    // format + save
    givesIn.value = resp.data.gives.map(give => ({
      ...give,
      give: toDAI(give.amount),
      receiver: [give.receiver]
    }))
  } catch (e) {
    console.error(e)
    givesIn.value = []
  }
}

// drips out
const splitsOut = ref()
const dripsOut = ref()
const givesOut = ref()

const allDripsOut = computed(() => {
  if (!dripsOut.value && !splitsOut.value && !givesOut.value) {
    return undefined // "loading"
  }
  const dOut = dripsOut.value || []
  const sOut = splitsOut.value || []
  const gOut = givesOut.value || []
  return [...dOut, ...sOut, ...gOut]
})

const allReceivers = computed(() => {
  return allDripsOut.value?.filter(d => d.receiver.length).map(d => d.receiver[0])
})
  
// get splits out
const getSplitsOut = async () => {
  try {
    const splits = await store.dispatch('getSplitsBySender', route.params.address)
    // format + save
    splitsOut.value = splits.map(split => ({
      ...split,
      receiver: [split.receiver]
    }))
  } catch (e) {
    console.error(e)
    splitsOut.value = []
  }
}

// balance / withdrawable
const withdrawable = ref()
const balance = computed(() => withdrawable.value ? toDAI(withdrawable.value) : -1)
let getWithdrawable

// get drips out
const getDripsOut = async () => {
  try {
    const config = await store.dispatch('getDripsBySender', route.params.address)
    // format + save
    dripsOut.value = config.receivers.map(drip => ({
      id: drip.id,
      sender: route.params.address,
      receiver: [drip.receiver],
      amount: toDAIPerMo(drip.amtPerSec), 
      amtPerSec: drip.amtPerSec,
    }))
    // get/set balance
    getWithdrawable = config.withdrawable
    withdrawable.value = getWithdrawable()
    updateWithdrawable()
  } catch (e) {
    console.error(e)
    dripsOut.value = []
  }
}

// get gives out
const getGivesOut = async () => {
  try {
    const resp = await api({ query: queryGivesBySender, variables: { address: route.params.address }})
    
    // TODO - merge gives into one item? 
    // (how to handle timestamp and click to individual gives...)

    // format + save
    givesOut.value = resp.data.gives.map(give => ({
      ...give,
      give: toDAI(give.amount),
      receiver: [give.receiver]
    }))
  } catch (e) {
    console.error(e)
    givesOut.value = []
  }
}

// get nfts
const nfts = ref()
const getNFTs = async () => {
  try {
    const tokenReceiver = route.params.address
    const resp = await api({
      variables: { tokenReceiver },
      query: `
        query ($tokenReceiver: Bytes!) {
          tokens (where: {tokenReceiver: $tokenReceiver}) {
            tokenId
            tokenType { streaming }
            owner: tokenReceiver
            projectAddress: tokenRegistryAddress
            amtPerSec
            giveAmt
          }
        }
      `
    })
    nfts.value = resp.data?.tokens || []
  } catch (e) {
    console.error(e)
    nfts.value = []
  }
}

const goToMySplits = () => router.push({ name: 'user-drips-out', params: { address: store.state.address } })

const updateWithdrawable = () => {
  if (typeof getWithdrawable === 'function') {
    withdrawable.value = getWithdrawable()  
  }
}

// projects
const projects = ref()
const getProjects = async () => {
  try {
    const resp = await api({
      variables: { projectOwner: route.params.address },
      query: `
        query ($projectOwner: Bytes!) {
          fundingProjects (where: { projectOwner: $projectOwner }) {
            id
            name: projectName
            projectOwner
            daiSplit
            daiCollected
            tokenTypes {
              tokenTypeId
              streaming
              limit
              currentTotalAmtPerSec
              currentTotalGiven
              ipfsHash
              minAmt: minAmtPerSec
            }
            tokens {
              owner: tokenReceiver
              giveAmt
              amtPerSec
            }
          }
        }
      `
    })
    projects.value = resp.data.fundingProjects
  } catch (e) {
    console.error(e)
  }
}

// get profile
const getProfile = () => {
  // if empty set to null (undefined is loading state)
  store.dispatch('profiles/getProfile', { address: route.params.address })
    .then(() => {
      const profile = store.state.profiles.profiles[route.params.address]
      profileMeta.value = toRaw(profile?.meta) || null
    })
    .catch(() => { profileMeta.value = null })
}

// edit profile hint
const editProfileHint = ref(!sessionStorage.getItem('editProfileHintHidden'))
const hideEditProfileHint = () => {
  sessionStorage.setItem('editProfileHintHidden', 1)
  editProfileHint.value = false
}

// scroll down arrow link
const scrollDownArrowLink = computed(() => {
  return projects.value?.length ? '#memberships'
    : nfts.value?.length ? '#member-of'
      : false
})

onMounted(() => {
  getProfile()
  getSplitsIn()
  getDripsIn()
  getSplitsOut()
  getDripsOut()
  getProjects()
  getNFTs()
  getGivesIn()
  getGivesOut()
  if (isMyUser.value) {
    getMyCollectable()
  }
  // debug events
  // store.dispatch('getDripsReceiversByEvents', route.params.address)
})

watch(isMyUser, (val) => val && getMyCollectable())

provide('isMyUser', isMyUser)
// provide('allDripsOut', allDripsOut)
provide('dripsOut', dripsOut)
provide('withdrawable', withdrawable)
</script>

<script>
const resolveRouteAddress = async (to, next, skipProjectLookup = false) => {
  try {
    const address = to.params.address.toLowerCase()
    
    // redirect to lowercase
    if (address !== to.params.address) {
      return next({name: 'user', params: { address }})
    }

    // non-address? check if ENS name, redirect to 0x...
    if (!utils.isAddress(to.params.address)) {
      const address = await store.dispatch('resolveENS', to.params.address)
      if (address) {
        // TODO: allow ENS name urls instead of redirect
        return next({ name: 'user', params: { address }})
      }
    }

    // redirect to project?
    if (!skipProjectLookup) {
      // project look up timeout... (6s?)
      const projectTimeout = setTimeout(() => {
        console.warn('project lookup timed-out. skipping...')
        // rerun but skip project lookup
        return resolveRouteAddress(to, next, true)
      }, 6000)

      // lookup...
      const projectMeta = await store.dispatch('getProjectMeta', { projectAddress: address })
      clearTimeout(projectTimeout)
      if (projectMeta?.name) {
        console.log('user is project. redirecting...')
        // redirect to project
        return next({ name: 'project', params: { address }})
      }
    }
    
    // else load this user page
    next()
  } catch (e) {
    console.error(e)
    next()
  }
}

export default {
  beforeRouteEnter: (to, from, next) => resolveRouteAddress(to, next),
  beforeRouteUpdate: (to, from, next) => resolveRouteAddress(to, next) // skip project lookup
}
</script>

<template lang="pug">
article.profile.w-full.lg_pb-132


  //- (edit profile hint banner)
  template(v-if="isMyUser && editProfileHint")
    .sticky.top-0.left-0.w-full.z-30.md_fixed.md_top-auto.md_bottom-0.pointer-events-none
      .absolute.top-0.left-0.w-full.md_static
        .w-full.px-10.py-10.bg-gradient-to-t.md_bg-gradient-to-b.from-transparent.to-indigo-900.flex.justify-center
          //- body
          .h-80.rounded-full.text-indigo-900.text-md.font-semibold.flex.items-center.pl-32.pr-16.relative.pointer-events-auto(class="bg-greenbright-400")
            .flex.flex-1.items-center This is your profile :)
            //- edit btn
            button.h-54.ml-24.border-2ff.rounded-full.px-24.flex.items-center.justify-center.border-current.focus_ring.notouch_hover_ring.notouch_hover_ring-indigo-900(class="bg-indigo-900/25", @click="edit = 'profile'")
              | Edit
            //- hide edit hint btn
            button.p-12.ml-6.notouch_hover_scale-110.transform.transition.duration-150(@click="hideEditProfileHint")
              svg-x.h-10.w-10(strokeWidth="2", strokeCap="round")

  //- user upper summary
  section.min-h-screen.-mt-88.flex.w-full.items-center.pt-104.pb-120.relative
    .w-full
      //- 
      //- senders
      drips-list-expands(:address="$route.params.address", :drips="allDripsIn", direction="in")

      //- (collectable)
      template(v-if="isMyUser && (allDripsIn && allDripsIn.length)")
        .flex.justify-center.mb-20
          .h-60.bg-indigo-950.flex.items-center.borderff.border-violet-700.rounded-full.text-lg.text-violet-650.font-semibold.pl-24.pr-12(:class="{'text-violet-650': collectableTotal === -1}", :key="$route.params.address")
            template(v-if="collectableTotal !== -1")
              | {{ collectableTotal }}
              svg-dai(size="sm", style="margin-left:0.15em")
            template(v-else)
              .animate-pulse ...
            
            button.ml-16.btn.h-36.border-2.btn-outline-violet.text-base.font-semibold.px-12(@click="collectModalOpen = true") Collect

      //- user tag row
      div.mx-auto.flex.flex-col
        user-tag(:address="$route.params.address", :isEditable="isMyUser", @editClick="edit = 'profile'", @dripClick="dripModalOpen = true")
        
        //- memberships + nft counts

        //- section.mt-6.flex.flex-wrap.justify-center.font-semibold.text-ms.text-violet-650(v-if="(projects && projects.length) || (nfts && nfts.length)")
          //- (memberships)
          router-link.rounded-full.min-w-180.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2.notouch_hover_ring.notouch_hover_ring-violet-650(to="#memberships", :class="{'opacity-40 pointer-events-none': projects && !projects.length}")
            .ml-4.mr-12.flex-1 🧧&nbsp;&nbsp;Memberships
            .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center
              span.text-mss(v-if="projects") {{ projects.length}}
              span.animate-pulse(v-else) ...
          
          //- (nfts)
          router-link.rounded-full.min-w-180.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2.notouch_hover_ring.notouch_hover_ring-violet-650(to="#member-of", :class="{'opacity-40 pointer-events-none': nfts && !nfts.length}")
            .ml-4.mr-12.flex-1 🧩 &nbsp;&nbsp;Member of
            .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center
              span.text-mss(v-if="nfts") {{ nfts.length}}
              span.animate-pulse(v-else) ...
      
      //- (balance)
      template(v-if="isMyUser && (dripsOut && dripsOut.length)")
        .flex.justify-center.mt-20
          .h-60.bg-indigo-950.flex.items-center.borderff.border-violet-700.rounded-full.text-lg.text-violet-650.font-semibold.pl-24.pr-12(:class="{'text-violet-650': balance === -1}", :key="$route.params.address")
            template(v-if="balance !== -1")
              | {{ balance }}
              svg-dai(size="sm", style="margin-left:0.15em")
            template(v-else)
              .animate-pulse ...
            
            button.ml-16.btn.h-36.border-2.btn-outline-violet.text-base.font-semibold.px-12(@click="edit = 'funds'")
              | Deposit

      //- receivers
      drips-list-expands(:address="$route.params.address", :drips="allDripsOut", direction="out", :canEdit="isMyUser", @editDrips="editDripsSelect = true")

      //- (down arrow button)
      .relative(v-if="scrollDownArrowLink")
        .absolute.w-full.flex.justify-center.pt-72.animate-bounce
          router-link.h-36.w-36.notouch_hover_bg-indigo-950.rounded-full.flex.items-center.justify-center(:to="scrollDownArrowLink")
            svg-arrow-right.h-20.w-20.text-violet-650.transform.rotate-90


  //- (memberships list)
  section(v-if="projects && projects.length")
    //- wave divider
    .bg-img-wave-shadow-violet
    
    //- header
    header#memberships.flex.justify-center.mt-56.pt-56
      h2.h-80.font-semibold.bg-indigo-700.flex.items-center.rounded-full.text-violet-650.px-22
        .h-36.w-36.flex.items-center.justify-center.text-lgg.-ml-2 🧧
        .text-xl.ml-12 Memberships
        .h-40.w-40.ml-16.rounded-full.bg-indigo-900.flex.items-center.justify-center.text-white.text-base
          | {{ projects.length }}
    
    //- small text summary
    p.flex.justify-center.mt-60
      .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-6.pr-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semiboldff
        router-link.flex.items-center.rounded-full.pl-4.py-4.notouch_hover_violet-600.notouch_hover_text-white.mr-5(:to="{name: 'user', params: { address: route.params.address }}")
          user-avatar.w-24.h-24.mr-7(:address="route.params.address")
          addr.font-bold(:address="route.params.address")
        div is raising funds with #[b NFT Memberships] 

    //- projects list
    .mt-72.flex.flex-wrap.justify-evenly
      //- projects...
      template(v-for="(project, i) in projects")
        //- (excerpted)
        template(v-if="showAllMemberships || i < 2")
          project-detail.mb-132(:project="project", @collected="getProjects")

    //- (show all btn)
    footer.flex.justify-center.-mt-40(v-if="projects.length > 2")
      button.btn-mdd.rounded-full.btn-darkest.text-violet-650.pl-26.pr-12.font-semibold.text-lg(@click="showAllMemberships = !showAllMemberships")
        .flex.items-center
          div {{ showAllMemberships ? 'View Less' : 'View All' }}
          svg-chevron-down.h-36.w-36.ml-4(:class="{'transform origin-center rotate-180': showAllMemberships}")

  

  //- (nfts list)
  section.mt-132(v-if="nfts && nfts.length")
    //- wave divider
    .bg-img-wave-shadow-violet

    //- header
    header#member-of.flex.justify-center.mt-56.pt-56
      h2.h-80.font-semibold.bg-indigo-700.flex.items-center.rounded-full.text-violet-650.px-22
        .h-40.w-40.flex.items-center.justify-center.text-xl.-ml-2 🧩
        .text-xl.ml-12 Member of
        .h-40.w-40.ml-18.rounded-full.bg-indigo-900.flex.items-center.justify-center.text-white.text-base
          | {{ nfts.length }}

    //- summary text
    p.flex.justify-center.mt-60
      .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-6.pr-20.h-44.font-semiboldff.text-violet-650.text-ms.font-semiboldff
        router-link.flex.items-center.rounded-full.pl-4.py-4.notouch_hover_violet-600.notouch_hover_text-white.mr-5(:to="{name: 'user', params: { address: route.params.address }}")
          user-avatar.w-24.h-24.mr-7(:address="route.params.address")
          addr.font-bold(:address="route.params.address")
        div has joined {{ nfts.length }} #[b NFT Membership{{ nfts.length > 1 ? 's' : ''}}].

    //- nft list
    ul.mt-72.flex.flex-wrap.justify-evenly
      //- nfts...
      template(v-for="(nft, i) in nfts")
        //- (excerpted)
        template(v-if="showAllNFTs || i < 3")
          li.w-full.max-w-4xl.my-36
            user-nft.w-full(:nft="nft")

    //- (show all btn)
    footer.flex.justify-center.mt-80.mb-120(v-if="nfts.length > 3")
      button.btn-mdd.rounded-full.btn-darkest.text-violet-650.pl-26.pr-12.font-semibold.text-lg(@click="showAllNFTs = !showAllNFTs")
        .flex.items-center
          div {{ showAllNFTs ? 'View Less' : 'View All' }}
          svg-chevron-down.h-36.w-36.ml-4(:class="{'transform origin-center rotate-180': showAllNFTs}")

  
  //- admin modals
  template(v-if="isMyUser")
    //- EDIT PROFILE MODAL
    modal-edit-profile(v-if="edit === 'profile'", :open="edit === 'profile'", @close="edit = null", :meta="profileMeta", @updated="getProfile")

    //- COLLECT MODAL
    modal-collect-drips(v-if="collectModalOpen", :open="collectModalOpen", @close="collectModalOpen = false; getMyCollectable()", :amts="collectableAmts", @collected="getMyCollectable")
      template(v-slot:header) Collect your Drips

    //- EDIT DRIPS/SPLITS
    //- select drip type to edit...
    modal-edit-drips-select(:open="editDripsSelect", @close="editDripsSelect = false", @select="e => { edit = e; editDripsSelect = false }", :edit="allDripsOut && allDripsOut.length")

    //- (edit drips or balance)
    template(v-if="['drips', 'funds'].includes(edit)")
      modal-drips-edit(:open="['drips', 'funds'].includes(edit)", @close="edit = null; getDripsOut()", @updated="getDripsOut", :addFundsOnly="edit === 'funds'")
        template(v-slot:header)
          h6 Drip to Others
        template(v-slot:description)
          p {{ allDripsOut && allDripsOut.length ? 'Edit the' : 'Add' }} addresses to drip funds to #[b.text-violet-650 every month.]

    //- edit splits...
    template(v-if="edit==='splits'")
      modal-splits-edit(:open="edit === 'splits'", @close="edit = null; getSplitsOut()", @updated="getSplitsOut", @viewSplits="goToMySplits")
        template(v-slot:header)
          h6 Split your Drips
        template(v-slot:description)
          p.mx-auto(style="max-width:22em")
            | Anytime you receive drips, they will be #[b split] with the addresses below:
          //- 
            template(v-if="splitsOut && splitsOut.length")
              | Edit the addresses you #[b.text-violet-650 share]<br>your incoming funds with.
            template(v-else)
              | Add addresses that you will #[b.text-violet-650 share]<br>your incoming funds with.

  //- (OTHER USER)
  template(v-else)
    template(v-if="dripModalOpen")
      //- drip to this user
      modal-drip-to(:address="$route.params.address", :open="dripModalOpen", @close="dripModalOpen = false")
        template(v-slot:header)
         h6 Drip to<br>#[addr.text-violet-650(:address="props.address")]

</template>
