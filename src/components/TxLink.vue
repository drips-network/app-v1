<script setup>
import store from '@/store'
const props = defineProps({
  tx: Object,
  clss: { type: String, default: 'text-violet-600 text-ms' }
})
</script>

<template lang="pug">
.mt-16.text-center(:class="props.clss")
  a(:key="props.tx.hash", :href="`${$store.getters.network.explorer.domain}/tx/${props.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on {{ $store.getters.network.explorer.name }} ↗
</template>
