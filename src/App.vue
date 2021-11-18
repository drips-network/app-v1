<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import SvgLogo from './components/SvgLogo.vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import SvgX from './components/SvgX.vue'
import store from '@/store'

store.dispatch('init')
</script>

<template lang="pug">
#app.max-w-screen-2xl.mx-auto.p-10.text-base.font-sans
  header.h-80.rounded-full.bg-indigo-700.flex.items-center.justify-between
    //- left side
    router-link.pl-24.-ml-px.mb-px(to="/")
      svg-logo.text-white

    //- right side
    .flex.items-center.mr-24.text-violet-650
      //- links
      router-link.mr-28.notouch_hover_text-white.transition.duration-100(:to="{name: 'create'}") Create
      router-link.mr-28.notouch_hover_text-white.transition.duration-100(:to="{name: 'home'}") Explore
      //- (profile btn)
      template(v-if="$store.state.address")
        .group.btn.btn-sm.btn-darker.pl-6.pr-12.text-white.font-semibold
          router-link.flex.items-center.text-ms(:to="{name: 'user', params: {address: $store.state.address}}")
            avatar-blockie.w-28.mr-6(:address="$store.state.address", width="28")
            | {{ $store.getters.addrShort($store.state.address) }}
          button.notouch_hidden.notouch_group-hover_block.ml-12.ml-10(@click="$store.dispatch('disconnect')", title="Disconnect")
            svg-x.h-12.w-12.text-white.mr-6(strokeWidth="1.5")
      //- (disconnect btn)
      template(v-else)
        button.btn.btn-sm.btn-darker.px-20(@click="$store.dispatch('connect')") Connect

  main#main
    router-view
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.web3modal-modal-lightbox{
  @apply z-50;
}
</style>
