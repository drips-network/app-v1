<script setup>
import Modal from '@/components/Modal'
import PanelDripsEdit from '@/components/PanelDripsEdit'
const emit = defineEmits(['close'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel-drips-edit.z-10.m-auto(:cancelBtn="true", @close="$emit('close')")

</template>
