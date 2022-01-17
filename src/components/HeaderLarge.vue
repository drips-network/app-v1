<script setup>
const props = defineProps(['icon'])
</script>

<template lang="pug">
.w-full.flex.justify-center
  .flex.bg-indigo-950.borderff.border-violet-700.rounded-full.items-center
    .h-44.w-44.flex.items-center.justify-center.text-base {{ props.icon }}
    .-ml-6.text-base.pr-20.text-violet-650
      slot
</template>
