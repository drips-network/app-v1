<script setup>
import { ref, useSlots, useAttrs, watch } from 'vue'
import SvgPen from '@/components/SvgPen.vue'

const slots = useSlots()

const props = defineProps({
  label: String,
  icon: String,
  collapsed: { type: Boolean, default: false },
  isEditable: { type: Boolean, default: true }
})

const emit = defineEmits(['open'])

const isCollapsed = ref(props.collapsed)

const open = () => {
  isCollapsed.value = false
  emit('open')
}
const close = () => { isCollapsed.value = true }

// make close() available in parent component
defineExpose({ open, close })
</script>

<template lang="pug">
section.panel.panel-dark.w-full.max-w-6xl.text-center
  //- (collapsed bar)
  button.h-80.w-full.flex.items-center.justify-center.relative.text-xll.font-semibold.group(v-show="isCollapsed", @click.prevent="open")
    //-
    .absolute.top-0.left-28.h-full.flex.items-center.text-2xl {{ icon }}
    | {{ label }}
    .absolute.top-0.right-20.h-full.flex.items-center
      template(v-if="props.editable")
        svg-pen.h-28.text-white.opacity-30.notouch_group-hover_opacity-100

  //- (open body)
  .pt-48.px-24.pb-24(v-show="!isCollapsed")
    header.mb-40.text-center
      //- icon
      .mb-20.text-3xl(v-if="icon") {{ icon }}
      
      //- header
      .text-2xl.font-semibold.mb-28.leading-tight
        slot(name="header")

      //- description
      .text-base.leading-snug
        slot(name="description")

    //- body
    .mt-40
      slot
</template>
