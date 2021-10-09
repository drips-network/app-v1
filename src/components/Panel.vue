<script setup>
import { useSlots, useAttrs } from 'vue'

const slots = useSlots()

const props = defineProps({
  icon: String
})
</script>

<template lang="pug">
section.panel.panel-dark.w-full.max-w-screen-sm.text-center.pt-44.px-20.pb-20
  header.mb-40.text-center
    .mb-20.text-2xl(v-if="icon") {{ icon }}

    .text-2xl.font-semibold.mb-40
      slot(name="header")

    slot(name="description")

  //- body
  .mt-40
    slot
</template>
