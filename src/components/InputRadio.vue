<script setup>
import { ref, computed } from 'vue'
const props = defineProps(['id', 'name', 'value', 'modelValue'])
const emit = defineEmits(['update:modelValue'])
const isChecked = computed(() => props.value === props.modelValue)
const onChange = () => emit('update:modelValue', props.value)
</script>

<script>
export default {
  inheritAttrs: false
}
</script>

<template lang="pug">
label.rounded-full.border.flex.border-violet-700.items-center.text-xl.font-semibold.cursor-pointer.focus-within_border-violet-600(:for="props.value")
  .w-80.h-80.flex.items-center.justify-center
    .w-36.h-36.p-3.rounded-full.flex.border.border-violet-700
      input.w-full.rounded-full(type="radio", :id="props.value", :name="props.name", :value="props.value", @change="onChange", :checked="isChecked")
  .flex-1.text-center.pr-54(:class="{'text-violet-650': !isChecked}")
    slot
</template>

<style scoped lang="postcss">
input:checked{
  @apply bg-violet-650;
}
</style>