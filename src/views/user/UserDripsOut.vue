<script setup>
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const route = useRoute()

const dripsOut = [
  { sender: route.params.address, receiver: '0x0630a42785b8a92205a492b3092279529990ed0c', amount: 10 },
  { sender: route.params.address, receiver: '0x0630a42785b8a92205a492b3092279529990ed0c', percent: 5 },
  { sender: route.params.address, receiver: '0xeca823848221a1da310e1a711e19d82f43101b07', amount: 5 },
  // to project...
  { sender: route.params.address, receiver: '0x87f3834fd4fce5781b4c12500de8b90b73342861', percent: 3 }
]
</script>

<template lang="pug">
section.user-splits

  info-bar.mb-20.justify-center.px-32
    div
      template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
      template(v-else) #[addr.font-bold(:address="$route.params.address")] is
      | &nbsp;<b>dripping</b> funds to <b>{{ dripsOut.length }} address{{ dripsOut.length === 1 ? '' : 'es' }}</b>

  ul
    li(v-for="drip in dripsOut")
      drip-row.my-2(:drip="drip")

</template>
