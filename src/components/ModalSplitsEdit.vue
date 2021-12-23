<script setup>
import Modal from '@/components/Modal'
import PanelSplitsEdit from '@/components/PanelSplitsEdit'
const emit = defineEmits(['close'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel-splits-edit.z-10.m-auto(:cancelBtn="true", @close="$emit('close')")

</template>
