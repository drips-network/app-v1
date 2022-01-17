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
const projectName = ref()

const addr = computed(() => {
  return props.youOn && isYou.value ? 'You' // "You"
    : projectName.value ? projectName.value // project name
      : profile.value?.ens ? profile.value.ens // ens name
        : props.short ? store.getters.addrShort(props.address) // shortened address
          : props.address // full address
})

const getName = async () => {
  try {
    profile.value = await store.dispatch('resolveAddress', { address: props.address })
    // 
    if (!profile.value?.ens) {
      // maybe it's a project? get name...
      const meta = await store.dispatch('getProjectMeta', { projectAddress: props.address })
      if (meta.name) {
        projectName.value = meta.name
      }
    }
  } catch (e) {
    profile.value = null
  }
}

// refresh profile if changes
// can't be a prop apparently?
// watch(props.address, () => {
//   profile.value = null
//   getName()
// })

onMounted(() => getName())
</script>

<template lang="pug">
span.addr {{ addr }}
</template>
