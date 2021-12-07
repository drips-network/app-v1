<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AvatarBlockie from '@/components/AvatarBlockie'
import Addr from '@/components/Addr'
import IconSplit from '@/components/IconSplit'
import ModalDripTo from '@/components/ModalDripTo'
import ModalCollectDrips from '@/components/ModalCollectDrips'
import SvgDai from '@/components/SvgDai'
import store from '@/store'
import { utils } from 'ethers'
import { toDAI } from '@/utils'

const route = useRoute()
const dripModalOpen = ref(false)
const collectModalOpen = ref(false)

const isMyUser = computed(() => store.state.address === route.params.address)

const collectableAmts = ref()
const num = wei => Number(toDAI(wei)).toFixed(2)
const totalFunds = computed(() => {
  return collectableAmts.value ? num(collectableAmts.value[0].add(collectableAmts.value[1])) : -1
})

watch(isMyUser, () => getMyCollectable())

const getMyCollectable = () => {
  store.dispatch('getCollectable', { address: route.params.address })
    .then(amts => { collectableAmts.value = amts })
    .catch(console.error)
}

onMounted(() => isMyUser.value && getMyCollectable())
</script>

<script>
const resolveRouteAddress = async (to, next, skipProjectLookup = false) => {
  try {
    const address = to.params.address.toLowerCase()
    
    // enforce lowercase
    if (address !== to.params.address) {
      next({name: 'user', params: { address }})
    }

    // timeout for slow API prj lookup... (6s?)
    // const projectTimeout = setTimeout(() => {
    //   console.warn('project lookup timeout. skipping...')
    //   resolveRouteAddress(to, next, true)
    // }, 6000)
    
    // check if project? redirect...
    // if (!skipProjectLookup && await store.dispatch('getProject', to.params.address)) {
    //   return next({ name: 'project', params: { address: to.params.address }})
    // }

    // clearTimeout(projectTimeout)
    
    // non-address? check if ENS name, redirect to 0x...
    if (!utils.isAddress(to.params.address)) {
      const address = await store.dispatch('resolveENS', to.params.address)
      if (address) {
        // TODO: allow ENS name urls instead of redirect
        return next({ name: 'user', params: { address }})
      }
    }
    // else
    next()
  } catch (e) {
    console.error(e)
    next()
  }
}

export default {
  beforeRouteEnter: (to, from, next) => resolveRouteAddress(to, next),
  beforeRouteUpdate: (to, from, next) => resolveRouteAddress(to, next)
}
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-52.px-36
    .flex.items-endff.items-center.justify-between.w-full
      //- user tag
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24.mr-36(:address="$route.params.address", width="112")
        h1.text-2xl.font-bold.pr-60
          addr(:address="$route.params.address", :youOn="true")

      //- (collect btn)
      template(v-if="isMyUser")
        //- template(v-if="totalFunds > -1")
        .h-80.flex.items-center.border.border-violet-700.rounded-full.text-xl.font-semibold.pl-36(:class="{'text-violet-650': totalFunds <= 0}")
          template(v-if="totalFunds > -1")
            svg-dai.mr-6(size="lg")
            | {{ totalFunds }}
          template(v-else)
            .animate-pulse ...
          
          button.ml-32.btn.btn-lg.btn-white.text-xl.font-semibold.pl-36.pr-32(@click="collectModalOpen = true") Collect 💧
      
      //- (drip to btn)
      template(v-else)
        button.btn.btn-lg.btn-white.font-semibold.text-md.pl-36.pr-32.text-xl(@click="dripModalOpen = true") Drip to 0x... 💧

    nav.mt-52.mb-20
      .flex.items-start.justify-between.text-violet-650
        .flex.tracking-wide
          router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.text-lg.pl-28.pr-36.mr-2(:to="{ name: 'user-communities', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-communities') }")
            span.mr-14.-ml-4(style="font-size:1.23em") 🙂
            | Communities
          router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.text-lg.pl-28.pr-36.mr-2(:to="{ name: 'user-drips', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-drips') }")
            span.mr-14.-ml-5(style="font-size:1.18em") 💧
            | Drips

        //- (communities submenu)
        template(v-if="$route.name.includes('user-communities')")
          .h-80.rounded-full.flex.items-center.px-16.bg-indigo-700
            router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-24.mr-2(:to="{ name: 'user-communities', params: $route.params }") Created
            router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-24.mr-2(:to="{ name: 'user-communities-joined', params: $route.params }") Joined

        //- (drips submenu)
        template(v-if="$route.name.includes('user-drips')")
          //- horizontal stem
          //- .w-40.h-40.border-b-2.border-indigo-700
          //- submenu body
          .h-80.rounded-full.flex.items-center.px-16.bg-indigo-700
            router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-in', params: $route.params }", ) In
            router-link.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-out', params: $route.params }", ) Out

  main#main.px-36.min-h-screen

    router-view(:key="$route.path")

  //- modals
  modal-drip-to(v-if="dripModalOpen", :address="$route.params.address", :open="dripModalOpen", @close="dripModalOpen = false")
    template(v-slot:header)
     h6 Drip to<br>#[addr.text-violet-650(:address="props.address")]

  modal-collect-drips(v-if="collectModalOpen", :open="collectModalOpen", @close="collectModalOpen = false", :amts="collectableAmts", @collected="getMyCollectable", dripPct="1")

</template>
