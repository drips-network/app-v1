<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import SvgLogo from './components/SvgLogo.vue'
import store from '@/store'

store.dispatch('init')
</script>

<template lang="pug">
#app.max-w-screen-2xl.mx-auto.p-10.text-base.font-sans
  header.h-80.rounded-full.bg-indigo-700.flex.items-center.justify-between.px-36
    router-link(to="/")
      svg-logo.h-16.text-white
    .flex
      router-link.ml-4(:to="{name: 'create'}") Create
      template(v-if="$store.state.address")
        .ml-16 {{ $store.state.address }}
        button.ml-16(@click="$store.dispatch('disconnect')") ✖️
      template(v-else)
        button.ml-16(@click="$store.dispatch('connect')") Connect

  main#main
    router-view
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
