<script setup>
const props = defineProps(['icon'])
</script>

<template lang="pug">
.w-full.flex.justify-center
  .flex.bg-indigo-950.borderff.border-violet-600.rounded-full.items-center
    .h-104.w-104.flex.items-center.justify-center.text-2xl {{ props.icon }}
    .-ml-12.text-xll.font-semibold.pr-56.text-violet-650
      slot
</template>
