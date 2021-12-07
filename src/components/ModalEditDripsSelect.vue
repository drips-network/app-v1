<script setup>
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import { DialogTitle, DialogDescription } from '@headlessui/vue'

const props = defineProps(['edit'])
const emit = defineEmits(['close', 'select'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")
  panel.z-10.m-auto(icon="💧")
    template(v-slot:header)
      dialog-title.leading-snug
        | Select Drip Type

    template(v-slot:description)
      dialog-description.mx-auto.leading-relaxed(style="max-widthff:26em")
        | Which type of drip would you like to {{ edit ? 'edit' : 'add' }}?

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'drips')") DAI/month
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'splits')") Share %

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-outline.px-40(@click="$emit('close')") Cancel
</template>