<script setup>
import { useAttrs } from 'vue'
import Modal from '@/components/Modal.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import PanelSplitsEdit from '@/components/PanelSplitsEdit.vue'
const emit = defineEmits(['close', 'viewSplits', 'updated'])
const attrs = useAttrs()
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel-splits-edit.z-10.m-auto(v-bind="$attrs", :cancelBtn="true", @close="$emit('close')", @viewSplits="$emit('viewSplits')", @updated="$emit('updated')")
    template(v-slot:header)
      dialog-title
        slot(name="header")

    template(v-slot:description)
      dialog-description
        slot(name="description")
</template>
