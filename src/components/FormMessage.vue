<script setup>
import { computed } from 'vue'
const props = defineProps({
  body: { type: Object, default: () => ({ message: '(Missing Info)' }) }
})
const color = computed(() => {
  return props.body.status === -1 ? 'text-red-600' // error
    : props.body.status === 1 ? 'text-greenbright-500' // success
      : 'text-violet-650' // message
})

// const ignore = computed(() => {
//   // ignore these messages
//   const msgs = [
//     'MetaMask Tx Signature: User denied transaction signature.'
//   ]
//   return msgs.includes(props.body.message)
// })
</script>

<template lang="pug">
//- outer
.px-40.flex.justify-center.text-center.text-ms.leading-normal(:class="[color]")
  //- box
  .borderff.border-current.py-16.px-24.rounded-lg.bg-indigo-950
    //- (success)
    //- template(v-if="props.body.status > 0")
      div Success!

    //- (error)
    template(v-if="props.body.status < 0")
      h6.mb-6.font-semibold Transaction Failed

    template(v-if="props.body.message")
      p(v-html="props.body.message")

</template>
