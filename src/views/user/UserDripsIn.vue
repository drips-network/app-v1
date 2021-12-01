<script setup>
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const dripsIn = []
</script>

<template lang="pug">
section.user-drips-in

  info-bar.mb-20.justify-center.px-32
    div
      | <b>{{ dripsIn.length }} address</b>{{ dripsIn.length === 1 ? ' is ' : 'es are ' }}
      | <b>dripping</b> funds to&nbsp;
      b(v-if="$store.getters.isWalletAddr($route.params.address)") you
      addr.font-bold(v-else, :address="$route.params.address")

</template>
