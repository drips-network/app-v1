<script setup>
// This app is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
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
const router = useRouter()

store.dispatch('init')

const connect = async () => {
  try {
    await store.dispatch('connect')
    // redirect to profile
    router.push({ name: 'user', params: { address: store.state.address } })
  } catch (e) {
    // ignore closing web3modal
    if (e !== 'Modal closed by user') {
      console.error(e)
      alert('Error connecting wallet')
    }
  }
}
</script>

<template lang="pug">
#app.max-w-screen-2xl.mx-auto.py-10.px-12.pb-104.md_pb-10.text-base.font-sans.leading-normal(style="min-widthff:1024px")
  .flex.flex-col.min-h-screen
    //- (wrong network banner)
    template(v-if="$store.getters.isWrongNetwork")
      .sticky.z-50.top-10.left-0.w-full.h-80.rounded-full.bg-yellow-500.text-black.flex.items-center.justify-between.mb-10
        .w-80.text-center.text-2xl ⚠️
        .flex-1.text-center.font-semibold Wrong Network! Switch to #[span.capitalize {{ networkName }}]!
        .w-80

    //- app header
    header.flex.items-center.justify-center.md_justify-between
      //- left side (mobile centered)
      .flex.items-center.h-80.rounded-full.bg-indigo-700.pr-32
        //- home / landing site link
        router-link.flex.items-center.-mt-px(to="/")
          .w-80.flex.justify-center.items-center.pb-px
            svg-logo-drop
          svg-logo.text-violet-650

        //- network changer
        .ml-24.relative.text-mss.leading-none
          //- network menu btn
          button.relative.z-10.rounded-lg.px-14.py-8.flex.items-center(@click="networkMenu = !networkMenu", :class="{'bg-indigo-900': !networkMenu, 'text-violet-650': networkName.includes('polygon'), 'text-greenbright-400': !networkName.includes('polygon') }")
            .transform.-translate-y-1 {{ networkName === 'mainnet' ? 'ethereum' : networkName }}
            //- chevron icon
            .w-6.h-6.ml-9.border-r.border-b.border-current.opacity-50.transform.origin-center(:class="{'-rotate-135': networkMenu, 'rotate-45 -translate-y-2': !networkMenu}")

          //- (network menu dropdown)
          ul.absolute.min-w-full.top-0.left-0.py-8.bg-indigo-950.rounded-md(v-show="networkMenu")
            li.py-2 &nbsp;
            //- ethereum link
            li(v-if="networkName !== 'mainnet'")
              a.inline-block.py-5.px-14.text-greenbright-500.notouch_hover_text-white.transition.duration-150(href="https://app.drips.network")
                template(v-if="networkName.includes('polygon')") ethereum
                template(v-else) mainnet
            //- polygon link
            li(v-if="networkName !== 'polygon'")
              a.inline-block.py-5.px-14.text-violet-650.notouch_hover_text-white.transition.duration-150(href="https://polygon.drips.network")
                | polygon

      //- right side (mobile bottom fixed)
      nav.app__nav.fixed.z-30.bottom-0.left-0.w-full.px-10.pb-10.md_static.md_p-0.md_w-auto.flex.justify-center.bg-gradient-to-b.from-transparent.to-indigo-900
        //- bubble
        .flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.pr-16.pl-12
          //- explore link
          router-link.app__nav__link.mr-5.text-md.font-semibold.border-2.border-transparent.notouch_hover_border-violet-650.h-56.px-24.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(:to="{name: 'explore'}") Explore
          //- create link
          router-link.app__nav__link.mr-5.text-md.font-semibold.border-2.border-transparent.notouch_hover_border-violet-650.h-56.px-24.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(:to="{name: 'create'}") Create
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
              button.ml-2.p-10.mr-8.notouch_hover_text-white(@click="$store.dispatch('disconnect')", title="Disconnect")
                svg-x.h-12.w-12(strokeWidth="2")
          //- (connect btn)
          template(v-else)
            button.btn.btn-md.btn-darker.px-24.text-md.font-semibold(@click="connect") Connect

    main#main.flex-1.flex
      router-view.w-full(:key="$route.params && JSON.stringify($route.params)")

  //- footer.p-6.mt-144.flex.justify-between.items-end
    .bg-indigo-900.text-ms.text-violet-650.rounded-full.font-semibold.flex.items-center
      svg-dai.h-12
      | 1 ≈ $1

  //- footer
  .mt-144.md_mt-196.mb-64.md_mb-0.flex.flex-wrap.justify-center.md_justify-between
    //- radicle link
    a.my-4.order-last.md_order-none.h-80.pl-18.pr-16.flex.items-center.bg-indigo-700.text-violet-650.rounded-full.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(href="http://radicle.xyz", target="_blank", rel="noopener noreferrer")
      //- .w-56.h-56.flex.items-center.justify-center.bg-indigo-900.rounded-full.text-xl 🌱
      .ml-16.flex.mt-2.text-base.font-semiboldff
        span.opacity-75 by
        //- &nbsp;#[b radicle.xyz]
        svg-logo-radicle.ml-12.h-16.block(style="transform:translateY(0.03em)")

      .ml-3.-mr-1.w-56.h-56.flex.items-center.justify-center.bg-indigo-900ff.rounded-full.text-xl.mb-2 🌱

    .my-4.flex.items-center.text-violet-650.h-80.rounded-full.bg-indigo-700.px-12

      //- landing site link
      a.mr-6.text-lg.font-semibold.notouch_hover_ring.notouch_hover_ring-violet-650.h-54.px-18.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(href="https://www.drips.network") About
      //- docs link
      a.mr-6.text-lg.font-semibold.notouch_hover_ring.notouch_hover_ring-violet-650.h-54.px-18.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(href="https://docs.drips.network/docs/whats-a-drip.html", target="_blank", rel="noopener noreferrer") Docs
      //- twitter link
      a.mr-6.text-lg.font-semibold.notouch_hover_ring.notouch_hover_ring-violet-650.h-54.w-54.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(href="https://twitter.com/dripsnetwork", target="_blank", rel="noopener noreferrer")
        svg-twitter.w-36
      //- discord channel link
      a.mr-6.text-lg.font-semibold.notouch_hover_ring.notouch_hover_ring-violet-650.h-54.w-54.rounded-full.flex.items-center.justify-center.notouch_hover_text-white.transition.duration-100(href="https://discord.gg/zCjkTT4MnZ", target="_blank", rel="noopener noreferrer")
        svg-discord.h-36
      //- dai/usd conversion tip
      a.ml-10.text-md.font-semibold.h-54.w-104.rounded-full.flex.items-center.justify-center.bg-indigo-950.notouch_hover_ring(href="https://www.coinbase.com/price/dai", target="_blank", rel="noopener noreferrer")
        svg-dai.h-16
        | 1 ≈ $1
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
  z-index: 50 !important;
}
/* purgecss end ignore */
</style>
