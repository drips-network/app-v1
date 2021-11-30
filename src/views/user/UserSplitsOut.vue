<script setup>
import IconSplits from '@/components/IconSplit'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const splits = []
</script>

<template lang="pug">
section.user-splits

  info-bar.mb-20.justify-center.px-32
    div
      template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
      template(v-else) #[addr.font-bold(:address="$route.params.address")] is
      | &nbsp;<b>splitting</b> incoming funds with <b>{{ splits.length }} address{{ splits.length === 1 ? '' : 'es' }}</b>

</template>
