<script setup>
import { useSlots, useAttrs } from 'vue'

const slots = useSlots()

const props = defineProps({
  icon: String
})
</script>

<template lang="pug">
section.create-panel.panel-dark.mx-auto.w-full.max-w-screen-sm.text-center.pt-40.px-20.pb-20
  header.mb-40.text-center
    .mb-16.text-2xl(v-if="icon") {{ icon }}

    .text-2xl.font-semibold
      slot(name="header")

  //- body
  .mt-40
    slot
</template>
