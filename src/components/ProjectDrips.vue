<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'

const props = defineProps({
  projectAddress: String
})

const drips = ref([])
const dripsFraction = ref(0)
const dripsFractionMax = store.state.dripsFractionMax

const dripsList = computed(() => {
  const weightsTotal = drips.value.reduce((acc, itm) => acc + itm?.weight, 0)
  return drips.value.map(item => {
    let percent = (item.weight / weightsTotal) * dripsFraction.value / dripsFractionMax * 100
    percent = percent.toFixed(3)
    return { percent, ...item }
  })
})

onBeforeMount(() => {
  // get drips
  store.dispatch('getProjectDripReceivers', props.projectAddress)
    .then(arr => { drips.value = arr })
  // get drip fraction (INT out of 1_000_000)
  store.dispatch('getProjectDripFraction', props.projectAddress)
    .then(int => { dripsFraction.value = int })
})
</script>

<template lang="pug">
section.project-drips.relative
  header.absolute.top-32.left-60
    .relative
      //- drip svg
      <svg width="53" height="105" viewBox="0 0 53 105" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.703 1.4375C26.1883 10.7016 21.6907 31.2553 14.0312 46.2484C11.9986 50.2272 10.1248 53.5804 8.46873 56.5441C3.88435 64.7481 0.968262 69.9667 0.968262 77.2053C0.968262 89.5222 11.3443 103.613 26.703 103.613V1.4375ZM26.703 1.4375C27.2177 10.7016 31.7153 31.2553 39.3748 46.2484C41.4074 50.2272 43.2812 53.5804 44.9373 56.5441C49.5217 64.7481 52.4377 69.9667 52.4377 77.2053C52.4377 89.5222 42.0617 103.613 26.703 103.613V1.4375Z" fill="#17164B"/>
      </svg>
      //- title
      h2.absolute.top-54.left-0.w-full.flex.justify-center.text-3xl.font-semibold Drips

  .flex.justify-end
    ul
      h6 dripFraction: {{ dripsFraction }} of {{ dripsFractionMax }} ({{ (dripsFraction / dripsFractionMax).toFixed(3) }}%)
      li(v-for="item in dripsList")
        pre.p-10.border.white.font-sans
          | {{ item.receiver }}
          | weight: {{ item.weight }}
          | percent: {{ item.percent }}%
</template>
