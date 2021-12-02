<script setup>
import { ref, onBeforeMount } from 'vue'
import store from '@/store'
const props = defineProps({
  address: String,
  short: { type: Boolean, default: true }
})

const addr = ref(props.short ? store.getters.addrShort(props.address) : props.address)

onBeforeMount(async () => {
  addr.value = await store.dispatch('resolveAddress', {
    address: props.address,
    short: props.short
  })
})
</script>

<template lang="pug">
span.addr {{ addr }}
</template>
