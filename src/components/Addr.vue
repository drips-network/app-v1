<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'

const props = defineProps({
  address: String,
  short: { type: Boolean, default: true },
  youOn: { type: Boolean, default: false }
})
const emit = defineEmits(['ens'])

const addr = ref(props.short ? store.getters.addrShort(props.address) : props.address)
const isYou = computed(() => props.address === store.state.address)

onMounted(() => {
  if (props.youOn && isYou.value) return
  // get ENS...
  store.dispatch('resolveAddress', { address: props.address })
    .then(ens => {
      if (ens) {
        addr.value = ens
        emit('ens', ens)
      }
    })
})
</script>

<template lang="pug">
span.addr {{ props.youOn && isYou ? 'You' : addr }}
</template>
