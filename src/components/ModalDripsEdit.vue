<script setup>
import { useAttrs } from 'vue'
import Modal from '@/components/Modal'
import PanelDripsEdit from '@/components/PanelDripsEdit'
const emit = defineEmits(['close'])
const attrs = useAttrs()
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel-drips-edit.z-10.m-auto(v-bind="$attrs", :cancelBtn="true", @close="$emit('close')", @updated="$emit('updated')")

</template>
