<script setup>
import { ref, onBeforeMount } from 'vue'
import store from '@/store'
const props = defineProps({
  address: String,
  short: { type: Boolean, default: true }
})

const addr = ref(props.short ? store.getters.addrShort(props.address) : props.address)

onBeforeMount(async () => {
  const ens = await store.dispatch('resolveAddress', { address: props.address })
  addr.value = ens || store.getters.addrShort(props.address)
})
</script>

<template lang="pug">
span.addr {{ addr }}
</template>
