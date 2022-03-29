<script setup>
import { ref, onMounted } from 'vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
const props = defineProps({
  expandedClasses: { type: String, default: 'line-clamp-4' },
  chevronInsetClass: { type: String, default: 'bottom-7' },
  html: { type: String, default: '' }
})
const el = ref()
const clampEnabled = ref(false)
const expanded = ref(false)
onMounted(() => {
  // TODO - use ResizeObserver?
  clampEnabled.value = el.value && el.value.scrollHeight > el.value.offsetHeight
})
</script>

<template lang="pug">
//- option to set .relative above this component
div
  div(ref="el", :class="{'line-clamp-3': !expanded}", v-html="props.html")
  //- readmore/less btn
  template(v-if="clampEnabled")
    .absolute.left-0.w-full.flex.justify-center(:class="props.chevronInsetClass")
      button.notouch_hover_text-white(@click="expanded = !expanded")
        svg-chevron-down.w-32.h-32(:class="{'transform rotate-180': expanded}")
</template>