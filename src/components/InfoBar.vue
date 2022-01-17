<script setup>
const props = defineProps({
  btnLabel: String
})
const emit = defineEmits(['btnClick'])
</script>

<template lang="pug">
.info-bar.bg-indigo-950.rounded-full.text-md.text-violet-650.h-80.flex.items-center.relative
  slot

  //- (right btn)
  template(v-if="props.btnLabel")
    .absolute.top-0.right-12.h-full.flex.items-center
      button.btn.btn-md.btn-outline.text-md.px-22.font-semibold.notouch_hover_text-white.transition.duration-150(@click.prevent="$emit('btnClick')")
        | {{ btnLabel }}
</template>
