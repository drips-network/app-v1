<script setup>
import { ref, computed, watch, onMounted, provide, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserTag from '@/components/UserTag.vue'
import AvatarBlockie from '@/components/AvatarBlockie.vue'
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
import ProjectDetail from '@/components/ProjectDetail.vue'
import DripsListExpands from '@/components/DripsListExpands.vue'
import store from '@/store'
import { utils } from 'ethers'
import { toDAI, toDAIPerMo, formatSplitsEvents } from '@/utils'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const ensName = computed(() => store.state.addresses[route.params.address]?.ens)
const profileMeta = ref()
const dripModalOpen = ref(false)
const collectModalOpen = ref(false)
const showAllSenders = ref(false)
const showAllReceivers = ref(false)

// my account
const isMyUser = computed(() => store.state.address === route.params.address)
const editDripsSelect = ref(false)
const edit = ref(null) // 'drips' | 'splits' | 'profile'
const collectableAmts = ref()
const totalFunds = computed(() => {
  return !collectableAmts.value ? -1
    : toDAI(collectableAmts.value[0].add(collectableAmts.value[1]))
})

watch(isMyUser, (val) => val && getMyCollectable())

const getMyCollectable = () => {
  store.dispatch('getCollectable', { address: route.params.address })
    .then(amts => { collectableAmts.value = amts })
    .catch(console.error)
}

// drips in
const splitsIn = ref()
const dripsIn = ref()

const allDripsIn = computed(() => {
  if (!dripsIn.value && !splitsIn.value) {
    return undefined // "loading"
  }
  const dIn = dripsIn.value || []
  const sIn = splitsIn.value || []
  return [...dIn, ...sIn]
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
      amount: toDAIPerMo(drip.amtPerSec) // toDAIPerMo(drip[1])
    }))
  } catch (e) {
    console.error(e)
    dripsIn.value = []
  }
}

// drips out
const splitsOut = ref()
const dripsOut = ref()

const allDripsOut = computed(() => {
  if (!dripsOut.value && !splitsOut.value) {
    return undefined // "loading"
  }
  const dOut = dripsOut.value || []
  const sOut = splitsOut.value || []
  return [...dOut, ...sOut]
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

// get drips out
const withdrawable = ref()
let getWithdrawable
const getDripsOut = async () => {
  try {
    const config = await store.dispatch('getDripsBySender', route.params.address)
    // format + save
    dripsOut.value = config.receivers.map(drip => ({
      sender: route.params.address,
      receiver: [drip.receiver], // [drip[0]],
      amount: toDAIPerMo(drip.amtPerSec) // toDAIPerMo(drip[1])
    }))
    getWithdrawable = config.withdrawable
    withdrawable.value = getWithdrawable()
  } catch (e) {
    console.error(e)
    dripsOut.value = []
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
            amount: amtPerSec
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
              # tokenTypeId
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

// profile
const getProfile = () => {
  // if empty set to null (undefined is loading state)
  store.dispatch('profiles/getProfile', { address: route.params.address })
    .then(() => {
      profileMeta.value = toRaw(store.state.profiles.profiles[route.params.address]?.meta) || null
    })
    .catch(() => { profileMeta.value = null })
}

onMounted(() => {
  if (isMyUser.value) {
    getMyCollectable()
  }
  getProfile()
  getSplitsIn()
  getDripsIn()
  getSplitsOut()
  getDripsOut()
  getProjects()
  getNFTs()
})

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
article.profile.pt-40.pb-80

  //- (your profile...)
  template(v-if="isMyUser")
    .flex.justify-center.mb-40
      .mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.h-44.font-semiboldff.text-greenbright-400.text-ms
        .px-22 This is your profile!
        //- (edit btn)
        template(v-if="profileMeta !== undefined")
          button.-ml-8.mr-12.py-4.pl-11.leading-none.font-semibold.rounded-full.flex.items-center.btn-outline-green(@click="edit = 'profile'")
            | Edit
            svg-pen.mx-5.h-16.w-16

  //- 
  //- senders
  drips-list-expands(:address="$route.params.address", :drips="allDripsIn", direction="in", :canEdit="!isMyUser")

  //- (collectable)
  template(v-if="isMyUser")
    .flex.justify-center.mb-20
      .h-64.bg-indigo-950.flex.items-center.borderff.border-violet-700.rounded-full.text-lg.text-violet-650.font-semibold.pl-32.pr-12(:class="{'text-violet-650': totalFunds === -1}", :key="$route.params.address")
        template(v-if="totalFunds !== -1")
          svg-dai(size="sm", style="margin-right:0.15em")
          | {{ totalFunds }}
        template(v-else)
          .animate-pulse ...
        
        button.ml-20.btn.btn-sm.border-2.btn-outline-violet.text-md.font-semibold.px-14(@click="collectModalOpen = true") Collect

  //- user tag row
  div.mx-auto.flex.flex-col
    user-tag(:address="$route.params.address", :isEditable="isMyUser")
    
    section.mt-6.flex.flex-wrap.justify-center.font-semibold.text-ms.text-violet-650
      //- (bio link)
      //- template(v-if="bio")
        .w-full.flex.justify-center.order-last
          router-link.rounded-full.min-w-196ff.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2.notouch_hover_ring.notouch_hover_ring-violet-650(to="#bio", :class="{'opacity-40 pointer-events-none': projects && !projects.length}")
            .ml-4.mr-12.flex-1 ✏️&nbsp;&nbsp;Bio
          //- .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center
            span(v-if="projects") {{ projects.length}}
            span.animate-pulse(v-else) ...

      //- (memberships)
      router-link.rounded-full.min-w-180.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2.notouch_hover_ring.notouch_hover_ring-violet-650(to="#memberships", :class="{'opacity-40 pointer-events-none': projects && !projects.length}")
        .ml-4.mr-12.flex-1 🧧&nbsp;&nbsp;Memberships
        .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center
          span(v-if="projects") {{ projects.length}}
          span.animate-pulse(v-else) ...
      
      //- (nfts)
      router-link.rounded-full.min-w-180.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2.notouch_hover_ring.notouch_hover_ring-violet-650(to="#member-of", :class="{'opacity-40 pointer-events-none': nfts && !nfts.length}")
        .ml-4.mr-12.flex-1 🧩 &nbsp;&nbsp;Member of
        .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center
          span(v-if="nfts") {{ nfts.length}}
          span.animate-pulse(v-else) ...


    //- template(v-if="bio")
      router-link.w-full.max-w-md.mx-auto.bg-indigo-950.rounded-2xlb.flex.items-center.mt-5.notouch_hover_ring.notouch_hover_ring-violet-650(to="#bio")
        .w-full.px-16.py-9
          p.truncate.font-semibold.text-ms.text-violet-650(v-html="bio")

  //- drip to button
  //- button.w-112.h-112.ml-12.flex.items-center.justify-center.bg-white.rounded-full.pr-4ff
    //- div.-ml-2.pt-2(style="font-size:2.4em") 💧
    div.-ml-3ff.font-semiboldff.text-black.pb-4(style="font-size:2.4em") +

  
  //- receivers
  drips-list-expands(:address="$route.params.address", :drips="allDripsOut", direction="out", :canEdit="isMyUser")


  //- bio/description
  //- template(v-if="bio")
    section#bio.my-120.flex.justify-center.relative
      h3.sr-only About
      //- h3.absolute.top-0.left-0.w-full.text-center.text-sm.pt-6.text-violet-650 Bio
      p.rounded-2xlb.bg-indigo-950.p-28.text-center.text-xl.font-semibold.bg-violet-650.text-white.leading-normal(v-html="bio", style="max-width:30em")

  
  //- memberships list
  section#memberships
    .mt-80.pt-60(v-if="projects && projects.length")
      header.flex
        h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
          div #[addr.font-bold(:address="$route.params.address")] is raising funds with 🧧 #[b NFT Memberships] 

      .mt-120.flex.flex-wrap.justify-evenly
        //- projects...
        template(v-for="project in projects")
          //- user-project(:project="project", @collected="getProjects")
          project-detail.mb-160(:project="project", @collected="getProjects")


  //- nfts list
  section#member-of
    div.mt-80.pt-60.px-20(v-if="nfts && nfts.length")
      header.flex
        h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
          div #[addr.font-bold(:address="$route.params.address")] has #[b {{ nfts.length }} NFT Membership{{ nfts.length > 1 ? 's' : ''}}] 🧩

      ul.mt-120.flex.flex-wrap.justify-center
        //- nfts...
        li.px-10.w-1x3(v-for="nft in nfts")
          user-nft.w-full(:nft="nft")


  //- admin modals
  template(v-if="isMyUser")
    //- EDIT PROFILE
    modal-edit-profile(v-if="edit === 'profile'", :open="edit === 'profile'", @close="edit = null", :meta="profileMeta", @updated="getProfile")

    //- COLLECT
    modal-collect-drips(v-if="collectModalOpen", :open="collectModalOpen", @close="collectModalOpen = false; getMyCollectable()", :amts="collectableAmts", @collected="getMyCollectable")
      template(v-slot:header) Collect your Drips

    //- EDIT
    //- select drip type to edit...
    modal-edit-drips-select(:open="editDripsSelect", @close="editDripsSelect = false", @select="e => { edit = e; editDripsSelect = false }", :edit="allDripsOut && allDripsOut.length")

    //- edit drips...
    template(v-if="edit === 'drips'")
      modal-drips-edit(:open="edit === 'drips'", @close="edit = null; getDrips()", @updated="getDrips", :addFundsOnly="edit === 'funds'")
        template(v-slot:header)
          h6 Drip to Others
        template(v-slot:description)
          p {{ allDripsOut && allDripsOut.length ? 'Edit the' : 'Add' }} addresses to drip funds to #[b.text-violet-650 every month.]

    //- edit splits...
    template(v-if="edit==='splits'")
      modal-splits-edit(:open="edit === 'splits'", @close="edit = null; getSplits()", @updated="getSplits", @viewSplits="goToMySplits")
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
