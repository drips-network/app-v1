<script setup>
const props = defineProps({
  tx: Object
})
</script>

<template lang="pug">
.mt-16.text-violet-600.text-center.text-base
  a(:href="`https://rinkeby.etherscan.io/tx/${props.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗
</template>
