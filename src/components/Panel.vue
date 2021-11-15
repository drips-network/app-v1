<script setup>
import { ref, useSlots, useAttrs } from 'vue'
import SvgPen from '@/components/SvgPen'

const slots = useSlots()

const props = defineProps({
  label: String,
  icon: String,
  collapsed: { type: Boolean, default: false }
})

const isCollapsed = ref(props.collapsed.value)

const open = () => { isCollapsed.value = false }
const close = () => { isCollapsed.value = true }

// make close() available in parent component
defineExpose({ open, close })
</script>

<template lang="pug">
section.panel.panel-dark.w-full.max-w-screen-sm.text-center
  //- collapsed bar
  button.h-80.w-full.flex.items-center.justify-center.relative.text-2xl.font-semibold.group(v-show="isCollapsed", @click.prevent="open")
    | {{ label }}
    .absolute.top-0.right-20.h-full.flex.items-center
      svg-pen.h-28.text-white.opacity-30.notouch_group-hover_opacity-100

  //- open body
  .pt-44.px-24.pb-24(v-show="!isCollapsed")
    header.mb-40.text-center
      .mb-20.text-2xl(v-if="icon") {{ icon }}

      .text-2xl.font-semibold.mb-40
        slot(name="header")

      slot(name="description")

    //- body
    .mt-40
      slot
</template>
