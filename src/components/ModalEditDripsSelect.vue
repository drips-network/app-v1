<script setup>
import Modal from '@/components/Modal.vue'
import Panel from '@/components/Panel.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'

const props = defineProps(['edit'])
const emit = defineEmits(['close', 'select'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")
  panel.z-10.m-auto(icon="💧")
    template(v-slot:header)
      dialog-title.leading-snug
        | {{ edit ? 'Edit your' : 'Add' }} Drips

    template(v-slot:description)
      dialog-description.mx-auto.leading-relaxed.text-violet-650(style="max-widthff:26em")
        | Which #[b.text-violet-650 type] would you like to {{ edit ? 'edit' : 'add' }}?

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'drips')") Monthly Drips 🗓
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'splits')") Drip Splitting 💦

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-outline.px-40(@click="$emit('close')") Cancel
</template>
