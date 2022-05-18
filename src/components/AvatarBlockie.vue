<script setup>
import { ref, onMounted } from 'vue'
import { createIcon } from '@/plugins/blockies.ts'

const props = defineProps({
  address: String,
  // width: { type: String, default: '72' }
})

const imgUrl = ref()

const generate = () => {
  const avatar = createIcon({
    seed: props.address.toLowerCase(),
    size: 8,
    scale: 16,
  });

  imgUrl.value = avatar.toDataURL()
}

onMounted(() => generate())
</script>

<template lang="pug">
img.avatar-blockie.rounded-full.overflow-hidden(:src="imgUrl", :alt="`Blockie avatar of ${props.address}`", :title="props.address")
</template>

<style>
</style>
