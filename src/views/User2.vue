<script setup>
import { ref, computed, watch, onMounted, provide, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserTag from '@/components/UserTag'
import AvatarBlockie from '@/components/AvatarBlockie'
import UserAvatar from '@/components/UserAvatar'
import Addr from '@/components/Addr'
import AddressesTag from '@/components/AddressesTag'
import IconSplit from '@/components/IconSplit'
import ModalDripTo from '@/components/ModalDripTo'
import ModalCollectDrips from '@/components/ModalCollectDrips'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect'
import ModalDripsEdit from '@/components/ModalDripsEdit'
import ModalSplitsEdit from '@/components/ModalSplitsEdit'
import SvgDai from '@/components/SvgDai'
import SvgChevronDown from '@/components/SvgChevronDown'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import HeaderLarge from '@/components/HeaderLarge'
import UserProject from '@/components/UserProject'
import UserNft from '@/components/UserNFT'
import store from '@/store'
import api from '@/api'
import { utils } from 'ethers'
import { toDAI, toDAIPerMo, formatSplitsEvents } from '@/utils'

const route = useRoute()
const router = useRouter()
const ensName = computed(() => store.state.addresses[route.params.address]?.ens)
const dripModalOpen = ref(false)
const collectModalOpen = ref(false)

// my account
const isMyUser = computed(() => store.state.address === route.params.address)
const editDripsSelect = ref(false)
const edit = ref(null) // 'drips' : 'splits'
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

// drips
const splits = ref()
const drips = ref()

const splitsOut = computed(() => {
  return splits.value?.map(split => ({
    sender: route.params.address,
    receiver: [split.address],
    percent: split.percent
  }))
})

const dripsOut = computed(() => {
  return drips.value?.map(drip => ({
    sender: route.params.address,
    receiver: [drip[0]],
    amount: toDAIPerMo(drip[1])
  }))
})

const allDripsOut = computed(() => {
  if (!dripsOut.value && !splitsOut.value) {
    return undefined // "loading"
  }
  const dOut = dripsOut.value || []
  const sOut = splitsOut.value || []
  return [...dOut, ...sOut]
})

const allReceivers = computed(() => {
  if (allDripsOut.value) {
    let all = allDripsOut.value.reduce((acc, cur) => acc.concat(cur.receiver), [])
    all = [...new Set(all)] // de-dupe
    return all
  }
  return undefined
})
const showAllReceivers = ref(false)
  

const getSplits = async () => {
  try {
    splits.value = (await store.dispatch('getSplitsReceivers', route.params.address)).percents
  } catch (e) {
    console.error(e)
  }
}

const withdrawable = ref()
const getDrips = async () => {
  try {
    const lastUpdate = await store.dispatch('getDripsReceivers', route.params.address)
    drips.value = lastUpdate.receivers
    withdrawable.value = await lastUpdate.withdrawable()
  } catch (e) {
    console.error(e)
  }
}

const goToMySplits = () => router.push({ name: 'user-drips-out', params: { address: store.state.address } })

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
            projectOwner
            daiSplit
            daiCollected
            tokenTypes {
              # tokenTypeId
              streaming
              limit
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

// nfts
const nfts = ref()
const getMemberships = async () => {
  try {
    const resp = await api({
      variables: { tokenReceiver: route.params.address },
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
  }
}

onMounted(() => {
  if (isMyUser.value) {
    getMyCollectable()
  }
  getSplits()
  getDrips()
  getProjects()
  getMemberships()
})

provide('isMyUser', isMyUser)
provide('allDripsOut', allDripsOut)
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
article.profile.pb-80
  //- NEW
  .flex.w-full.justify-center.mt-60
    div
      .w-full.flex.justify-center
        //- (loading senders...)
        template(v-if="!allReceivers")
          .h-80.w-260.rounded-full.bg-indigo-950.font-semibold.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse Loading...

        //- (view senders toggle)
        template(v-else)
          button.min-w-160.rounded-full.flex.justify-center.items-center.pointer-events-auto.notouch_hover_ring.notouch_hover_ring-violet-650(@click.stop="showAllReceivers = !showAllReceivers", :class="{'bg-indigo-700': !showAllReceivers, 'bg-indigo-950': showAllReceivers}")
            //- (addresses)
            addresses-tag(v-show="!showAllReceivers", v-if="allReceivers", :addresses="allReceivers")
            //- (collapsed label)
            .h-72.flex.items-center.font-semibold.text-lg.text-violet-650.pl-36.pr-14(v-show="showAllReceivers") Supporters
            //- toggle icon
            .w-54.h-54.flex.items-center.justify-center.-ml-12.mr-8
              svg-chevron-down.text-violet-650.w-40.h-40(:class="{'transform origin-center rotate-180': showAllReceivers}")
      
      //- (senders list)
      ul.flex.flex-wrap.justify-center.mt-20(v-if="allDripsOut", v-show="showAllReceivers")
        //- .w-full.flex.justify-center
          .h-80.w-2.rounded-full.bg-violet-700.my-6
        li(v-for="drip in allDripsOut")
          router-link.flex.items-center.bg-indigo-700.rounded-full.p-10.my-4.mx-3.notouch_hover_ring.notouch_hover_ring-violet-650.notouch_hover_text-white.transition.duration-150(:to="{name: 'user', params: { address: drip.receiver[0] }}")
            //- sender avatar / blockie
            user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="drip.receiver[0]", blockieSize="44", :key="drip.receiver[0]")
            addr.mx-16.font-semibold(:address="drip.receiver[0]", :key="drip.receiver[0]")

            .h-44.flex.items-center.px-10.bg-indigo-900.rounded-full
              //- drip icon
              div(style="font-size:1.25em") 💧

              //- amount
              div.font-semibold.text-violet-650.mx-6
                template(v-if="drip.amount") {{ drip.amount }}/mo
                template(v-else-if="drip.percent") {{ drip.percent }}%
        //- .w-full.flex.justify-center
          .h-80.w-2.rounded-full.bg-violet-700.my-6

  .w-full.flex.justify-center.my-10
    .w-80.h-80.flex.items-center.justify-center.overflow-visible(style="font-size:3em") 💧

  .w-full.flex.justify-center
    div
      //- user bar
      .bg-indigo-700.rounded-full.flex.items-center
        user-tag(:address="$route.params.address")

        button.-ml-18.mr-40.block.relative.text-indigo-900.transform.notouch_hover_scale-110.transition.duration-150(@click="dripModalOpen = true")
          <svg class="h-80" viewBox="0 0 90 105" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
          <path d="M15.6969 29.619L15.8371 29.4896L15.9503 29.336C16.0314 29.2259 16.1276 29.1159 16.2413 29.0079L43.1004 3.48239C43.9729 2.65328 45.342 2.65328 46.2144 3.48239L47.1669 2.4801L46.2144 3.48239L73.0736 29.0079C73.1863 29.115 73.2818 29.2241 73.3625 29.3333L73.4752 29.4857L73.6145 29.6143C81.9838 37.3374 87.213 48.3569 87.213 60.5902C87.213 83.9234 68.1727 102.861 44.6583 102.861C21.1438 102.861 2.10352 83.9234 2.10352 60.5902C2.10352 48.3594 7.33064 37.3419 15.6969 29.619Z" fill="currentColor" stroke-width="2.125"/>
          </svg>

          .absolute.overlay.flex.items-center.justify-center.pt-8
            svg-plus-minus-radicle.text-violet-650(style="transform:scale(1.25)")

      //- communities/memberships
      section.flex.justify-center.mt-10.mb-4.font-semibold.text-ms.text-violet-650
        .rounded-full.min-w-196.p-4.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2(v-if="projects && projects.length > 0")
          .ml-10.mr-12.flex-1 ⛲️ &nbsp;Communities
          .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center {{ projects.length}}
        
        .rounded-full.min-w-196.p-6.bg-indigo-950.flex.items-center.justify-between.px-10.mx-2(v-if="nfts && nfts.length > 0")
          .ml-10.mr-12.flex-1 🧩 &nbsp;Memberships
          .rounded-full.bg-indigo-950.min-w-28.h-28.text-ms.text-white.flex.items-center.justify-center {{ nfts.length }}

    //- drip to button
    //- button.w-112.h-112.ml-12.flex.items-center.justify-center.bg-white.rounded-full.pr-4ff
      //- div.-ml-2.pt-2(style="font-size:3em") 💧
      div.-ml-3ff.font-semiboldff.text-black.pb-4(style="font-size:3em") +

  .w-full.flex.justify-center.my-10
    .w-80.h-80.flex.items-center.justify-center.overflow-visible(style="font-size:3em") 💧

  .flex.justify-center
    addresses-tag(v-if="allReceivers", :addresses="allReceivers")

  
  //- communities
  section.mt-144(v-if="projects && projects.length")
    header.flex
      h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
        div #[addr.font-bold(:address="$route.params.address")] is raising funds in #[b {{ projects.length }} communit{{ projects.length > 1 ? 'ies' : 'y'}}] ⛲️

    ul.mt-60
      //- projects...
      li(v-for="project in projects")
        user-project(:project="project", @collected="getProjects")


  //- memberships
  section.mt-144.px-20(v-if="nfts && nfts.length")
    header.flex
      h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
        div #[addr.font-bold(:address="$route.params.address")] has #[b {{ nfts.length }} NFT Membership{{ nfts.length > 1 ? 's' : ''}}] 🧩

    ul.mt-60.grid.grid-cols-2.gap-40
      //- nfts...
      li.mb-ff.flex(v-for="nft in nfts")
        user-nft.w-full(:nft="nft")


  //- 
    header.mt-56.px-36
      .flex.items-endff.items-center.justify-between.w-full
        //- user tag
        user-tag(:address="$route.params.address")

        //- (collect btn)
        template(v-if="isMyUser")
          .flex.items-center
            //- template(v-if="totalFunds > -1")
            .h-80.flex.items-center.border.border-violet-700.rounded-full.text-xl.font-semibold.pl-32(:class="{'text-violet-650': totalFunds === -1}", :key="$route.params.address")
              template(v-if="totalFunds !== -1")
                | {{ totalFunds }}
                svg-dai.ml-6(size="lg")
              template(v-else)
                .animate-pulse ...
              
              button.ml-24.btn.btn-lg.btn-white.text-xl.font-semibold.pl-36.pr-32(@click="collectModalOpen = true") Collect 💧

            //- (edit drips btn)
            button.ml-6.btn.btn-lg.btn-violet.text-xl.font-semibold.pl-36.pr-32(@click="editDripsSelect = true") Edit Drips 💧
        
        //- (drip to btn)
        template(v-else)
          button.btn.btn-lg.btn-white.font-semibold.text-md.pl-36.pr-32.text-xl(@click="dripModalOpen = true")
            | Drip to {{ ensName ? ensName.slice(0, 7) : '0x' }}... 💧
            //- | Send Drips 💧

      nav.mt-56.mb-20
        .flex.items-start.justify-between.text-violet-650.text-lg
          .flex.tracking-wide
            router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.pl-28.pr-36.mr-2(:to="{ name: 'user-drips', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-drips') }")
              span.mr-14.-ml-5(style="font-size:1.18em") 💧
              | Drips
            router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.pl-28.pr-36.mr-2(:to="{ name: 'user-communities', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-communities') }")
              span.mr-14.-ml-4(style="font-size:1.23em") 🙂
              | Communities

          //- (communities submenu)
          template(v-if="$route.name.includes('user-communities')")
            .h-80.rounded-full.flex.items-center.px-16.bg-indigo-700
              router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-24.mr-4(:to="{ name: 'user-communities', params: $route.params }") Created
              router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-24(:to="{ name: 'user-communities-joined', params: $route.params }") Joined

          //- (drips submenu)
          template(v-if="$route.name.includes('user-drips')")
            //- horizontal stem
            //- .w-40.h-40.border-b-2.border-indigo-700
            //- submenu body
            .h-80.rounded-full.flex.items-center.px-16.bg-indigo-700
              router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-32.mr-4(:to="{ name: 'user-drips-in', params: $route.params }", ) In
              router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-32(:to="{ name: 'user-drips-out', params: $route.params }", ) Out

    main#main.px-36.min-h-screen

      router-view(:key="$route.path", @editDripsSelect="editDripsSelect = true", @editDrips="edit = 'drips'")

  //- (MY USER)
  template(v-if="isMyUser")
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
