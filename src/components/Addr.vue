<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import store from '@/store'

const props = defineProps({
  address: String,
  short: { type: Boolean, default: true },
  youOn: { type: Boolean, default: false }
})

const name = computed(() => store.getters['profiles/name'](props.address))

// rendered
const addr = computed(() => {
  // "You"
  return props.youOn && props.address.toLowerCase() === store.state.address ? 'You'
    // profile name
    : name.value ? name.value
      // address short
      : props.short ? store.getters.addrShort(props.address)
        // address full
        : props.address
})
</script>

<template lang="pug">
span.addr {{ addr }}
</template>
