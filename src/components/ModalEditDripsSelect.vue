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
        template(v-if="edit") Edit your Drips
        template(v-else) Drip to Others

    template(v-slot:description)
      dialog-description.leading-relaxed.text-violet-650
        p.mx-auto(v-if="edit", style="max-width:26em")
          | Which #[b.text-violet-650 type] of drips would you like to edit?
        p.mx-auto(v-else, style="max-width: 25em")
          | How would you like to start dripping?<br>You can drip funds to addresses <b>every month</b> or <b>split</b> your own incoming drips with others.

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'drips')") Drip Monthly&nbsp; 🗓
      button.btn.btn-lg.btn-violet.mx-3.px-40(@click="$emit('select', 'splits')") Split Drips&nbsp; 💦

    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-outline.px-40(@click="$emit('close')") Cancel
</template>
