<template lang="pug">
svg.block(@click="$emit('click')")
  line(x1="5%", y1="5%", x2="95%", y2="95%", stroke="currentColor", :stroke-width="strokeWidth", :stroke-linecap="strokeCap")
  line(x1="5%", y1="95%", x2="95%", y2="5%", stroke="currentColor", :stroke-width="strokeWidth", :stroke-linecap="strokeCap")
</template>

<script>
export default {
  name: 'SVG-X',
  props: {
    strokeWidth: { type: String, default: '1' },
    strokeCap: { type: String, default: 'butt' } // round, square, butt
  }
}
</script>
