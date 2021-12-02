<script setup>
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const route = useRoute()

const dripsIn = [
  { receiver: route.params.address, sender: '0x0630a42785b8a92205a492b3092279529990ed0c', amount: 10 },
  { receiver: route.params.address, sender: '0x0630a42785b8a92205a492b3092279529990ed0c', percent: 5 },
  { receiver: route.params.address, sender: '0xeca823848221a1da310e1a711e19d82f43101b07', amount: 5 },
  // to project...
  { receiver: route.params.address, sender: '0x87f3834fd4fce5781b4c12500de8b90b73342861', percent: 3 }
]
</script>

<template lang="pug">
section.user-drips-in

  info-bar.mb-20.justify-center.px-32
    div
      | <b>{{ dripsIn.length }} address</b>{{ dripsIn.length === 1 ? ' is ' : 'es are ' }}
      | <b>dripping</b> funds to&nbsp;
      b(v-if="$store.getters.isWalletAddr($route.params.address)") you
      addr.font-bold(v-else, :address="$route.params.address")

  ul
    li(v-for="drip in dripsIn")
      drip-row.my-2(:drip="drip")

</template>
