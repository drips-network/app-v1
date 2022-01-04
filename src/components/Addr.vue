<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'

const props = defineProps({
  address: String,
  short: { type: Boolean, default: true },
  youOn: { type: Boolean, default: false }
})

const defaultAddr = props.short ? store.getters.addrShort(props.address) : props.address
const addr = ref(defaultAddr)
const isYou = computed(() => props.address.toLowerCase() === store.state.address)

onMounted(async () => {
  try {
    const profile = await store.dispatch('resolveAddress', { address: props.address })
    addr.value = profile.ens || defaultAddr
  } catch (e) {
    addr.value = defaultAddr
  }
})
</script>

<template lang="pug">
span.addr {{ props.youOn && isYou ? 'You' : addr }}
</template>
