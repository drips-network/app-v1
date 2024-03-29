<script setup>
// This app is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, computed, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import { utils } from 'ethers'
import SvgLogo from '@/components/SvgLogo.vue'
import SvgLogoDrop from '@/components/SvgLogoDrop.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import SvgX from '@/components/SvgX.vue'
import SvgDai from '@/components/SvgDai.vue'
import SvgDiscord from '@/components/SvgDiscord.vue'
import SvgTwitter from '@/components/SvgTwitter.vue'
import SvgLogoRadicle from '@/components/SvgLogoRadicle.vue'
import Addr from '@/components/Addr.vue'

const networkName = JSON.parse(import.meta.env.VITE_APP_CONTRACTS_DEPLOY).NETWORK
const networkMenu = ref(false)
const route = useRoute()
const router = useRouter()
const hasConnected = ref(toRaw(store.state.address) !== null)
const versionMenuVisible = ref(false)
const newVersionBannerVisible = ref(!localStorage.getItem('newVersionBannerHidden'))
const profileBannerVisible = computed(() => {
  return !newVersionBannerVisible.value && !hasConnected.value && !store.state.address && !route.name?.startsWith('create') && route.meta.type !== 'legal'
})
const testnetsVisible = ref(false)

store.dispatch('init')

const connect = async (goToProfile = false) => {
  try {
    await store.dispatch('connect')

    if (goToProfile) {
      sessionStorage.removeItem('editProfileHintHidden')
      router.push({name: 'user', params: { address: store.state.address }})
    }

    hasConnected.value = true
  } catch (e) {
    // ignore closing web3modal
    if (e !== 'Modal closed by user') {
      console.error(e)
      alert(`Couldn't connect wallet. Is it locked?\n\n(${e})`)
    }
  }
}

const switchToAppNetwork = async () => {
  try {
    if (!window.ethereum) { throw new Error('No provider to change network') }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: utils.hexValue(store.state.deployNetworkId) }]
    })

    // TODO mobile MM doesn't change network or throw error (confirm chainId here?)

    // reload app
    window.location.reload()
  } catch (e) {
    console.error(e)
    alert('Could not switch networks. Try switching in your wallet and reloading the page.')
  }
}
 
function hideNewVersionBanner () {
  newVersionBannerVisible.value = false
  localStorage.setItem('newVersionBannerHidden', '1')
}
</script>

<template lang="pug">
#app.max-w-screen-2xlff.mx-auto.py-10.pb-104.md_pb-10.text-base.font-sans.leading-normal
  //- min-h-screen body
  .flex.w-full.flex-col.min-h-screen
    //- (wrong network banner)
    template(v-if="$store.state.address && $store.getters.isWrongNetwork")
      .sticky.z-50.top-10.left-0.w-full.px-12.mb-10
        .rounded-full.bg-yellow-500.text-black.flex.w-full.items-center.justify-between
          .w-80.text-center.text-2xl ⚠️
          .h-80.flex-1.flex.items-center.justify-center.text-center.font-semibold
            .absolute.overlay.flex.items-center.justify-center
              span Your wallet is connected to the wrong network!
          button.relative.z-10.h-54.mr-12.rounded-full.pl-28.pr-24.flex.items-center.justify-center.border-current.focus_ring.notouch_hover_ring.notouch_hover_ring-indigo-900.font-semibold(class="bg-indigo-900/25", @click="switchToAppNetwork")
            span Switch &rarr;

    //- app header
    header.relative.z-30.flex.items-center.justify-center.md_justify-between.px-12
      //- left side (mobile centered)
      .flex.w-full.justify-between.md_justify-start
        .h-80.rounded-full.bg-indigo-700.flex.items-center.pr-24
          //- home / landing site link
          router-link.flex.items-center.-mt-px.text-violet-650.notouch_hover_text-white.transition.duration-150(to="/")
            //- drip logo
            .w-80.flex.justify-center.items-center.pb-px.-mr-6
              svg-logo-drop(style="height:3.6rem")
            //- title logo
            svg-logo(style="height:3.2rem")

          //- version changer
          .relative.z-50.ml-20.leading-none.font-semibold.text-greenbright-400.text-ms
            //- network menu btn
            button.relative.z-10.rounded-lg.pl-20.py-12.flex.items-center(@click="versionMenuVisible = !versionMenuVisible", :class="{'bg-indigo-950': !versionMenuVisible, 'notouch_hover_ring notouch_hover_ring-violet-650': !versionMenuVisible }")
              .transform.-translate-y-1 v1
              //- chevron icon
              .w-6.h-6.ml-10.mr-16.border-r.border-b.border-current.opacity-50.transform.origin-center(:class="{'-rotate-135': networkMenu, 'rotate-45 -translate-y-2': !networkMenu}")

            //- (network menu dropdown)
            ul.absolute.min-w-full.top-0.left-0.py-12.bg-indigo-950.rounded-md(v-show="versionMenuVisible")
              li.py-2 &nbsp;
              //- ethereum link
              li
                a.inline-block.py-5.px-20.transition.duration-150.notouch_hover_text-white(href="https://drips.network", class="text-greenbright-400/90")
                  | v2

        //- network switcher
        .ml-16.h-80.rounded-full.bg-indigo-900.flex.items-center.text-ms.leading-none.font-semibold
          .relative.z-50
            //- network menu btn
            button.relative.z-10.rounded-lg.pl-20.py-12.flex.items-center(@click="networkMenu = !networkMenu", :class="{'bg-indigo-950': !networkMenu, 'text-violet-650': networkName.includes('polygon'), 'text-greenbright-400/90': !networkName.includes('polygon'), 'notouch_hover_ring notouch_hover_ring-violet-650': !networkMenu }")
              .transform.-translate-y-1 {{ networkName === 'mainnet' ? 'ethereum' : networkName }}
              //- chevron icon
              .w-6.h-6.ml-10.mr-16.border-r.border-b.border-current.opacity-50.transform.origin-center(:class="{'-rotate-135': networkMenu, 'rotate-45 -translate-y-2': !networkMenu}")

            //- (network menu dropdown)
            ul.absolute.min-w-full.top-0.left-0.py-12.bg-indigo-950.rounded-md(v-show="networkMenu")
              li.py-2 &nbsp;
              //- ethereum link
              li(v-if="networkName !== 'mainnet'")
                a.inline-block.py-5.px-20.transition.duration-150.notouch_hover_text-white(href="https://app.v1.drips.network", class="text-greenbright-400/90")
                  template(v-if="networkName.includes('polygon')") ethereum
                  template(v-else) mainnet
              //- rinkeby link
              //- li(v-if="testnetsVisible && networkName !== 'rinkeby'")
                a.inline-block.py-5.px-20.transition.duration-150.opacity-75.notouch_hover_opacity-100.notouch_hover_text-white(href="https://rinkeby.v1.drips.network", class="text-greenbright-400/90")
                  | rinkeby
              //- polygon link
              li(v-if="networkName !== 'polygon'")
                a.inline-block.py-5.px-20.text-violet-650.transition.duration-150.notouch_hover_text-white(href="https://polygon.v1.drips.network")
                  | polygon
              //- mumbai link
              li(v-if="testnetsVisible && networkName !== 'mumbai'")
                a.inline-block.py-5.px-20.text-violet-650.transition.duration-150.opacity-75.notouch_hover_opacity-100.notouch_hover_text-white(href="https://mumbai.v1.drips.network")
                  | mumbai
              //- (testnets button)
              li(v-show="!testnetsVisible")
                button.inline-block.py-5.px-20.transition.duration-150.notouch_hover_text-white(class="text-white/40", @click="testnetsVisible = true") testnets

      //- right side (mobile bottom fixed)
      nav.app__nav.fixed.z-30.bottom-0.left-0.w-full.px-10.pb-10.pt-196.md_static.md_p-0.md_w-auto.flex.justify-center.bg-gradient-to-b.from-transparent.to-indigo-900.pointer-events-none(:class="{'hidden md_flex': !store.state.address}")
        //- bubble
        .flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.pr-16.pl-12.pointer-events-auto
          //- explore link
          router-link.app__nav__link.mr-5.text-md.font-semibold.border-2.border-transparent.btn-focus-violet.h-56.px-24.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100(:to="{name: 'explore'}") Explore
          //- create link
          router-link.app__nav__link.mr-5.text-md.font-semibold.border-2.border-transparent.btn-focus-violet.h-56.px-24.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100.order-last.md_order-none(:to="{name: 'create'}") Drip
          //- (profile btn)
          template(v-if="$store.state.address")
            .btn.btn-md.bg-indigo-900
              .btn-darker.pl-8.text-violet-650.font-semibold.rounded-full
                router-link.flex.items-center.text-base.font-semibold(:to="{name: 'user', params: {address: $store.state.address}}")
                  //- avi
                  user-avatar.w-40.h-40.mr-10(:address="$store.state.address", :key="$store.state.address")
                  //- address
                  //- | {{ $store.getters.addrShort($store.state.address) }}
                  addr(:address="store.state.address", :key="store.state.address")
              button.ml-2.p-10.mr-8.notouch_hover_text-white.focus_text-white(@click="$store.dispatch('disconnect')", title="Disconnect")
                svg-x.h-12.w-12(strokeWidth="2")
          //- (connect btn)
          template(v-else)
            button.btn.btn-md.btn-darker.px-24.text-md.font-semibold.btn-focus-violet(@click="connect($route.name === 'explore')") Connect

    main#main.flex-1.flex
      router-view.w-full(:key="$route.params && JSON.stringify($route.params)")

    //- (view profile banner)
    template(v-if="profileBannerVisible")
      .sticky.mt-10.z-30.bottom-0.pb-10.left-0.w-full.px-10.bg-gradient-to-b.from-transparent.to-indigo-900.flex.justify-center
        .min-h-80.rounded-full.text-indigo-900.text-md.font-semibold.flex.flex-wrap.items-center.pl-32.pr-16.py-12(class="bg-greenbright-400")
          .flex.flex-1.items-center Connect a wallet to view your profile
          button.h-54.ml-24.border-2ff.rounded-full.pl-28.pr-24.flex.items-center.justify-center.border-current.focus_ring.notouch_hover_ring.notouch_hover_ring-indigo-900(class="bg-indigo-900/25", @click="connect(true)") Connect
    
    //- (new drips version banner)
    template(v-if="newVersionBannerVisible")
      .sticky.mt-10.z-30.bottom-0.pb-10.left-0.w-full.px-10.bg-gradient-to-b.from-transparent.to-indigo-900.flex.justify-center
        .relative.min-h-80.rounded-full.text-indigo-900.text-md.font-semibold.flex.flex-wrap.items-center.pl-32.pr-16.py-12(class="bg-greenbright-400")
          .flex.flex-1.items-center
            div New version of Drips!
          
          a.h-54.ml-24.rounded-full.pl-28.pr-24.flex.items-center.justify-center.border-current.focus_ring.notouch_hover_ring.notouch_hover_ring-indigo-900(class="bg-indigo-900/25", href="https://drips.network") Go to V2 ↗
          
          button.p-8.ml-8(@click="hideNewVersionBanner")
            .sr-only hide
            svg-x.h-12.w-12(strokeWidth="1.5")

  //- footer
  .mt-10.mb-64.md_mb-0.px-12.flex.flex-wrap.justify-center.md_justify-between
    //- radicle link
    a.my-4.order-last.md_order-none.h-80.pl-18.pr-16.flex.items-center.bg-indigo-700.text-violet-650.rounded-full.notouch_hover_ring.btn-focus-violet.transition.duration-150(href="http://radicle.xyz", target="_blank", rel="noopener noreferrer")
      //- .w-56.h-56.flex.items-center.justify-center.bg-indigo-900.rounded-full.text-xl 🌱
      .ml-16.flex.mt-2.text-base.font-semiboldff
        span.opacity-75 by
        //- &nbsp;#[b radicle.xyz]
        svg-logo-radicle.ml-12.h-16.block(style="transform:translateY(0.03em)")

      .ml-3.-mr-1.w-56.h-56.flex.items-center.justify-center.bg-indigo-900ff.rounded-full.text-xl.mb-2 🌱

    .my-4.flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.px-12

      //- landing site link
      a.mr-6.text-md.font-semibold.btn-focus-violet.h-54.px-18.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100(href="https://www.drips.network") About
      //- docs link
      a.mr-6.text-md.font-semibold.btn-focus-violet.h-54.px-18.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100(href="https://docs.drips.network/docs/whats-a-drip.html", target="_blank", rel="noopener noreferrer") Docs
      //- twitter link
      a.mr-6.text-lg.font-semibold.btn-focus-violet.h-54.w-54.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100(href="https://twitter.com/dripsnetwork", target="_blank", rel="noopener noreferrer")
        svg-twitter.w-36
      //- discord channel link
      a.mr-6.text-lg.font-semibold.btn-focus-violet.h-54.w-54.rounded-full.flex.items-center.justify-center.btn-focus-violet.transition.duration-100(href="https://discord.gg/zCjkTT4MnZ", target="_blank", rel="noopener noreferrer")
        svg-discord.h-36
      //- dai/usd conversion tip
      a.ml-10.text-md.font-semibold.h-54.w-104.rounded-full.flex.items-center.justify-center.bg-indigo-950.btn-focus-violet(href="https://www.coinbase.com/price/dai", target="_blank", rel="noopener noreferrer")
        svg-dai.h-16
        | 1 ≈ $1
  
  .py-6.text-violet-650.text-sm.text-center
    //- privacy link
    router-link.mx-6.inline-block.text-focus-violet(to="/privacy") Privacy
    //- access link
    router-link.mx-6.inline-block.text-focus-violet(to="/access") Access
    //- disclaimer link
    router-link.mx-6.inline-block.text-focus-violet(to="/disclaimer") Disclaimer

  
    //-
      .h-52.bg-indigo-900.border-2ff.border-violet-700.text-violet-650.text-lg.font-semibold.px-24.rounded-full.flex.items-center.justify-center
        svg-dai.h-16
        | 1 ≈ $1
      .h-56.bg-indigo-900.border-2.border-violet-700.text-violet-650.text-lg.font-semibold.px-24.rounded-full.flex.items-center.justify-center Help

  //- "view on laptop" mobile banner
  //- .mt-88.lg_hidden.pointer-events-none
    .fixed.z-50.bottom-10.left-0.w-screen.px-10
      .h-80.rounded-full.bg-gray-300.text-black.flex.items-center.justify-between
        .w-full.text-center.font-semibold Mobile coming soon&nbsp;#[span(style="font-size:1.5em") 🏗]
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-sans{
  /* inter font features? (doesn't seem to work like Inter on app.radicle.network/orgs) */
  /* font-feature-settings: "ss01", "ss02", "cv01", "cv03"; */
}

.app__nav__link.router-link-active{
  @apply text-white bg-violet-600;
}

/* purgecss start ignore */
.web3modal-modal-lightbox{
  z-index: 60 !important;
}
/* purgecss end ignore */
</style>
