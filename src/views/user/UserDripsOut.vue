<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import LoadingBar from '@/components/LoadingBar'
import Addr from '@/components/Addr'
import store from '@/store'

const route = useRoute()

const loading = ref(true)
const splits = ref([])

const splitsOut = computed(() => {
  return splits.value.map(split => ({
    sender: route.params.address,
    receiver: split.address,
    percent: split.percent
  }))
})

const dripsOut = computed(() => splitsOut.value || [])

onBeforeMount(async () => {
  try {
    const receivers = await store.dispatch('getSplitsReceivers', route.params.address)
    splits.value = receivers.percents
    loading.value = false
  } catch (e) {
    loading.value = false
  }
})
</script>

<template lang="pug">
section.user-splits

  template(v-if="loading")
    loading-bar

  template(v-else)
    info-bar.mb-20.justify-center.px-32
      div
        template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;<b>dripping</b> funds to <b>{{ dripsOut.length }} address{{ dripsOut.length === 1 ? '' : 'es' }}</b>

    ul
      li(v-for="drip in dripsOut")
        drip-row.my-2(:drip="drip")

    //- footer.mt-40.flex.justify-center
      button.btn.btn-lg.btn-outline.pl-36.pr-28 Add Drips 💧

</template>
