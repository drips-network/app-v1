<script setup>
const props = defineProps(['icon'])
</script>

<template lang="pug">
.w-full.mb-96.flex.justify-center.stickyff.z-20.top-6
  .flex.bg-indigo-950.borderff.border-violet-700.rounded-full.items-center
    .h-44.w-44.flex.items-center.justify-center.text-base {{ props.icon }}
    .-ml-6.text-base.font-semibold.pr-20.text-violet-650
      slot
//- small
  .w-full.flex.justify-center.mb-64
    .flex.bg-indigo-950.border.border-violet-700.rounded-full.items-center
      .h-44.w-44.flex.items-center.justify-center.text-md {{ props.icon }}
      .-ml-6.text-base.font-semibold.pr-20.text-violet-650
        slot
</template>
