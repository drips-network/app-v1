<script setup>
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const drips = []
</script>

<template lang="pug">
section.user-drips-in.mx-40

  template(v-if="!drips.length")
    info-bar.justify-center.px-32
      div
        | <b>{{ drips.length ? 'These' : '0' }}</b> addresses are dripping funds to&nbsp;
        template(v-if="$store.getters.isWalletAddr($route.params.address)") you
        addr.font-bold(v-else, :address="$route.params.address")
  //- list splits...
  template(v-else)

</template>
