<script setup>
// This app is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import store from '@/store'
import SvgLogo from './components/SvgLogo.vue'
import SvgLogoDrop from './components/SvgLogoDrop.vue'
import UserAvatar from '@/components/UserAvatar'
import SvgX from './components/SvgX.vue'
import SvgDai from './components/SvgDai.vue'
import SvgLogoRadicle from './components/SvgLogoRadicle.vue'
import Addr from '@/components/Addr'

const networkName = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY).NETWORK

store.dispatch('init')
</script>

<template lang="pug">
#app.max-w-screen-2xl.mx-auto.py-10.px-12.text-base.font-sans.leading-normal
  .flex.flex-col.min-h-screen
    //- (wrong network banner)
    template(v-if="$store.getters.isWrongNetwork")
      .sticky.z-50.top-10.left-0.w-full.h-80.rounded-full.bg-yellow-500.text-black.flex.items-center.justify-between.mb-10
        .w-80.text-center.text-2xl ⚠️
        .flex-1.text-center.font-semibold Wrong Network! Switch to #[span.capitalize {{ networkName }}]!
        .w-80

    //- app header
    header.flex.items-center.justify-between
      //- left side
      .flex.items-center.h-80.rounded-full.bg-indigo-700.pr-32
        //- home / landing site link
        a.flex.items-center.-mt-px(to="http://www.drips.network")
          .w-80.flex.justify-center.items-center.pb-px
            svg-logo-drop
          svg-logo.text-violet-650
        //- (test network name)
        .bg-indigo-900.borderf.border-violet-600.rounded-full.px-14.py-8.text-greenbright-500.text-mss.leading-none.ml-24(v-if="networkName.toLowerCase() !== 'mainnet'") {{ networkName }}

      //- right side
      nav.app__nav.flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.pr-16.pl-12
        //- links
        router-link.mr-5.text-md.font-semibold.border-2.border-transparent.notouch_hover_border-violet-650.h-56.px-24.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(:to="{name: 'explore'}") Explore
        router-link.mr-5.text-md.font-semibold.border-2.border-transparent.notouch_hover_border-violet-650.h-56.px-24.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(:to="{name: 'create'}") Create
        //- (profile btn)
        template(v-if="$store.state.address")
          .btn.btn-md.bg-indigo-900
            .btn-darker.pl-8.text-violet-650.font-semibold.rounded-full
              router-link.flex.items-center.text-base.font-semibold(:to="{name: 'user', params: {address: $store.state.address}}")
                //- avi
                user-avatar.w-36.h-36.mr-10(:address="$store.state.address", blockieSize="28")
                //- address
                //- | {{ $store.getters.addrShort($store.state.address) }}
                addr(:address="store.state.address", :key="store.state.address")
            button.ml-2.p-10.mr-8.notouch_hover_text-white(@click="$store.dispatch('disconnect')", title="Disconnect")
              svg-x.h-12.w-12(strokeWidth="2")
        //- (connect btn)
        template(v-else)
          button.btn.btn-md.btn-darker.px-24.text-md.font-semibold(@click="$store.dispatch('connect')") Connect

    main#main.flex-1.flex
      router-view.w-full(:key="$route.params && JSON.stringify($route.params)")

  //- footer.p-6.mt-144.flex.justify-between.items-end
    .bg-indigo-900.text-ms.text-violet-650.rounded-full.font-semibold.flex.items-center
      svg-dai.h-12
      | 1 ≈ $1

  //- help / docs link
  .mt-196.bottom-6.flex.justify-between
    //- radicle link
    a.h-80.pl-18.pr-16.flex.items-center.bg-indigo-800.text-violet-650.rounded-full.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(href="http://radicle.xyz", target="_blank", rel="noopener noreferrer")
      //- .w-56.h-56.flex.items-center.justify-center.bg-indigo-900.rounded-full.text-xl 🌱
      .ml-16.flex.mt-2.text-base.font-semiboldff
        span.opacity-75 by
        //- &nbsp;#[b radicle.xyz]
        svg-logo-radicle.ml-12.h-16.block(style="transform:translateY(0.03em)")

      .ml-3.-mr-1.w-56.h-56.flex.items-center.justify-center.bg-indigo-900ff.rounded-full.text-xl.mb-2 🌱

    .flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.px-12
      a.mr-5.text-lg.font-semibold.border-2.border-transparent.notouch_hover_border-violet-650.h-56.px-24.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(href="https://gallant-shaw-eaf02b.netlify.app/docs/whats-a-drip.html", target="_blank", rel="noopener noreferrer") Help

      .text-md.font-semibold.h-56.px-24.rounded-full.flex.items-center.justify-center.bg-indigo-950
        svg-dai.h-16
        | 1 ≈ $1
    //-
      .h-56.bg-indigo-900.border-2ff.border-violet-700.text-violet-650.text-lg.font-semibold.px-24.rounded-full.flex.items-center.justify-center
        svg-dai.h-16
        | 1 ≈ $1
      .h-56.bg-indigo-900.border-2.border-violet-700.text-violet-650.text-lg.font-semibold.px-24.rounded-full.flex.items-center.justify-center Help
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

.app__nav > .router-link-active{
  @apply text-white bg-violet-600;
}

/* purgecss start ignore */
.web3modal-modal-lightbox{
  z-index: 50 !important;
}
/* purgecss end ignore */
</style>
