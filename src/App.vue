<script setup>
// This app is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import SvgLogo from './components/SvgLogo.vue'
import SvgLogoDrop from './components/SvgLogoDrop.vue'
import UserAvatar from '@/components/UserAvatar'
import SvgX from './components/SvgX.vue'
import SvgDai from './components/SvgDai.vue'
import store from '@/store'

const networkName = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY).NETWORK

store.dispatch('init')
</script>

<template lang="pug">
#app.max-w-screen-2xl.mx-auto.p-10.text-base.font-sans.leading-normal
  .flex.flex-col.min-h-screen
    //- (wrong network banner)
    template(v-if="$store.getters.isWrongNetwork")
      .sticky.z-20.top-10.left-0.w-full.h-80.rounded-full.bg-yellow-500.text-black.flex.items-center.justify-between.mb-10
        .w-80.text-center.text-2xl ⚠️
        .flex-1.text-center.font-semibold Wrong Network! Switch to #[span.capitalize {{ networkName }}]!
        .w-80

    //- app header
    header.h-80.rounded-full.bg-indigo-700.flex.items-center.justify-between
      //- left side
      .flex.items-center
        router-link.flex.items-center.-mt-px(to="/")
          .w-80.flex.justify-center.items-center.pb-px
            svg-logo-drop
          svg-logo.text-violet-650
        //- (test network name)
        .bg-indigo-900.borderf.border-violet-600.rounded-full.px-14.py-8.text-greenbright-500.text-mss.leading-none.ml-24(v-if="networkName.toLowerCase() !== 'mainnet'") {{ networkName }}

      //- right side
      .flex.items-center.mr-24.text-violet-650
        //- links
        router-link.mr-28.notouch_hover_text-white.transition.duration-100(:to="{name: 'create'}") Create
        router-link.mr-28.notouch_hover_text-white.transition.duration-100(:to="{name: 'explore'}") Explore
        //- (profile btn)
        template(v-if="$store.state.address")
          .btn.btn-sm.bg-indigo-900
            .btn-darker.pl-6.text-violet-650.font-semibold.rounded-full
              router-link.flex.items-center.text-ms(:to="{name: 'user', params: {address: $store.state.address}}")
                //- avi
                user-avatar.w-28.h-28.mr-10(:address="$store.state.address", blockieSize="28")
                //- address
                | {{ $store.getters.addrShort($store.state.address) }}
            button.ml-2.p-10.mr-8.notouch_hover_text-white(@click="$store.dispatch('disconnect')", title="Disconnect")
              svg-x.h-10.w-10(strokeWidth="1.5")
        //- (disconnect btn)
        template(v-else)
          button.btn.btn-sm.btn-darker.px-20(@click="$store.dispatch('connect')") Connect

    main#main.flex-1.flex
      router-view.w-full(:key="$route.params && JSON.stringify($route.params)")

  footer.p-6
    .bg-indigo-900.text-ms.text-violet-650.rounded-full.font-semibold.flex.items-center
      svg-dai.h-12
      | 1 ≈ $1
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

/* purgecss start ignore */
.web3modal-modal-lightbox{
  z-index: 50 !important;
}
/* purgecss end ignore */
</style>
