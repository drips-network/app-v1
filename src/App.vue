<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
// import HelloWorld from './components/HelloWorld.vue'
import SvgLogo from './components/SvgLogo.vue'
</script>

<template lang="pug">
.max-w-screen-2xl.mx-auto.p-3
  header.h-20.rounded-full.bg-indigo-700.flex.items-center.justify-between
    div.pl-9
      svg-logo.h-5.text-white
  main#main
    router-view
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
