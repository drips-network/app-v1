<script setup>
import SvgDai from '@/components/SvgDai'

const props = defineProps({
  meta: Object
})
</script>

<template lang="pug">
.h-80.rounded-full.bg-indigo-800.relative
  //- right info
  .absolute.top-0.right-0.h-full.flex.items-center.pr-32.text-lg(v-if="meta.goal && meta.goal > 0")
    svg-dai.mr-4(size="sm")
    //- TODO: adapt goal
    | {{ typeof meta.goal === 'number' ? meta.goal.toLocaleString() : '?' }}/mo
</template>
