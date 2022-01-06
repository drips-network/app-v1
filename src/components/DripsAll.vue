<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store'
import DripRow from '@/components/DripRow'
import LoadingBar from '@/components/LoadingBar'
import { round } from '@/utils'

const splits = ref()

const getSplitsEvents = async () => {
  try {
    const events = await store.dispatch('getSplitsReceivers')
    console.log(events)
    // reduce by address (current state)
    const currentEvents = []
    events.reverse()
      .filter(event => event.args[1].length)
      .forEach(event => {
        if (!currentEvents.find(e => e.args[0] === event.args[0])) {
          currentEvents.push(event)
        }
      })
    // format for drip rows
    splits.value = currentEvents.map(e => {
      let percent = e.args[1].reduce((acc, cur) => acc + cur[1], 0) / store.state.splitsFractionMax * 100
      percent = percent > 0 && !parseInt(percent) ? '<1%' : parseInt(percent) // parseFloat(percent.toFixed(2))
      return {
        blockNumber: e.blockNumber,
        sender: e.args[0],
        receiver: e.args[1].length >= 2 ? e.args[1].length : e.args[1][0][0],
        percent
      }
    })
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  getSplitsEvents()
})
</script>

<template lang="pug">
section
  template(v-if="!splits")
    loading-bar
  template(v-else)
    ul
      li(v-for="drip in splits")
        drip-row.my-4(:drip="drip")
</template>
