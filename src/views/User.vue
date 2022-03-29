<script setup>
import { ref, computed, watch, onMounted, provide, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserTag from '@/components/UserTag.vue'
import AvatarBlockie from '@/components/AvatarBlockie.vue'
import Addr from '@/components/Addr.vue'
import IconSplit from '@/components/IconSplit.vue'
import ModalDripTo from '@/components/ModalDripTo.vue'
import ModalCollectDrips from '@/components/ModalCollectDrips.vue'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect.vue'
import ModalDripsEdit from '@/components/ModalDripsEdit.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import SvgDai from '@/components/SvgDai.vue'
import store from '@/store'
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
    ...split,
    receiver: [split.receiver],
  }))
})

const dripsOut = computed(() => {
  return drips.value?.map(drip => ({
    sender: route.params.address,
    receiver: [drip.receiver], // [drip[0]],
    amount: toDAIPerMo(drip.amtPerSec) // toDAIPerMo(drip[1])
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
  
// get splits
const getSplits = async () => {
  try {
    splits.value = await store.dispatch('getSplitsBySender', route.params.address)
  } catch (e) {
    console.error(e)
  }
}

// get drips
const withdrawable = ref()
let getWithdrawable
const getDrips = async () => {
  try {
    const config = await store.dispatch('getDripsBySender', route.params.address)
    drips.value = config.receivers
    getWithdrawable = config.withdrawable
    withdrawable.value = getWithdrawable()
  } catch (e) {
    console.error(e)
    drips.value = []
  }
}

const goToMySplits = () => router.push({ name: 'user-drips-out', params: { address: store.state.address } })

const updateWithdrawable = () => {
  if (typeof getWithdrawable === 'function') {
    withdrawable.value = getWithdrawable()  
  }
}

onMounted(() => {
  if (isMyUser.value) {
    getMyCollectable()
  }
  getSplits()
  getDrips()
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

    router-view(:key="$route.path", @editDripsSelect="editDripsSelect = true", @editDrips="edit = 'drips'", @getWithdrawable="updateWithdrawable")

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
