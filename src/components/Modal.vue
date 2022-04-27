<script setup>
import {
  Dialog as DialogBody,
  DialogOverlay
  // DialogTitle,
  // DialogDescription
} from '@headlessui/vue'
import Panel from '@/components/Panel.vue'

const props = defineProps({
  isOpen: Boolean,
  panelIcon: String
})

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<template lang="pug">
dialog-body.fixed.inset-0.z-30.overflow-y-auto.flex.py-60.px-30(:open="isOpen", @close="close")

  dialog-overlay.fixed.overlay.bg-indigo-900.opacity-75

  slot

  //- panel.z-10.m-auto(:icon="panelIcon")

    template(v-slot:header)
      //- pass to panel header
      dialog-title
        slot(name="header")

    template(v-slot:description)
      //- pass to panel description
      dialog-description.text-base.mx-auto(style="max-width:23em")
        slot(name="description")

    //- main modal
    slot

</template>
