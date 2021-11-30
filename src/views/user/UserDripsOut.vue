<script setup>
import IconSplits from '@/components/IconSplit'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const dripsOut = []
</script>

<template lang="pug">
section.user-splits

  info-bar.mb-20.justify-center.px-32
    div
      template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
      template(v-else) #[addr.font-bold(:address="$route.params.address")] is
      | &nbsp;<b>dripping</b> funds directly to <b>{{ dripsOut.length }} address{{ dripsOut.length === 1 ? '' : 'es' }}</b>

</template>
