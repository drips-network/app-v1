<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import store from '@/store'

const props = defineProps({
  address: String,
  short: { type: Boolean, default: true },
  youOn: { type: Boolean, default: false }
})

const profile = ref()
const isYou = computed(() => props.address.toLowerCase() === store.state.address)

const addr = computed(() => {
  return props.youOn && isYou.value ? 'You'
    : profile.value?.ens ? profile.value.ens
      : props.short ? store.getters.addrShort(props.address)
        : props.address
})

const getProfile = async () => {
  try {
    profile.value = await store.dispatch('resolveAddress', { address: props.address })
  } catch (e) {
    profile.value = null
  }
}

// refresh profile if changes
// can't be a prop apparently?
// watch(props.address, () => {
//   profile.value = null
//   getProfile()
// })

onMounted(() => getProfile())
</script>

<template lang="pug">
span.addr {{ addr }}
</template>
