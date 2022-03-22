<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import blockies from 'ethereum-blockies'

const el = ref(null)

const props = defineProps({
  address: String,
  width: { type: String, default: '72' }
})

const columns = 8
const scale = props.width * (window.devicePixelRatio || 1) / columns
let icon

function generate () {
  icon = blockies.create({ // All options are optional
    seed: props.address.toLowerCase(), // seed used to generate icon data, default: random
    // color: '#dfe', // to manually specify the icon color, default: random
    // bgcolor: '#aaa', // choose a different background color, default: random
    size: columns, // width/height of the icon in blocks, default: 8
    scale: scale // width/height of each block in pixels, default: 4
    // spotcolor: '#000' // each pixel has a 13% chance of being of a third color,
    // default: random. Set to -1 to disable it. These "spots" create structures
    // that look like eyes, mouths and noses.
  })
}

// twice because 1x is black ???? (https://github.com/ethereum/blockies/pull/6)
generate()
generate()

onMounted(() => {
  el.value.appendChild(icon)
})
</script>

<template lang="pug">
.avatar-blockie.rounded-full.overflow-hidden.relative(ref="el")
</template>

<style>
.avatar-blockie canvas{
  width: 100%;
}
</style>
