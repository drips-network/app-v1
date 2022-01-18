<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import LoadingBar from '@/components/LoadingBar'
import Addr from '@/components/Addr'
import store from '@/store'
import { toDAIPerMo } from '@/utils'

const route = useRoute()

const dripsIn = ref()
const splitsIn = ref()

const allDripsIn = computed(() => {
  if (!dripsIn.value && !splitsIn.value) return undefined
  const dIn = dripsIn.value || []
  const sIn = splitsIn.value || []
  return [...dIn, ...sIn]
})

const getDripsIn = async () => {
  try {
    const allDripsEvents = await store.dispatch('getDripsReceivers') || []

    // filter by this user
    const userDripsInEvents = allDripsEvents.reverse().filter(event => {
      return event?.args[2].length && event.args[2].find(receiver => receiver[0].toLowerCase() === route.params.address)
    })

    // reduce to most recent update
    const currentUserDripsIn = []
    userDripsInEvents.forEach(event => {
      // add if not added already
      if (!currentUserDripsIn.find(e => e.args[0] === event.args[0])) {
        currentUserDripsIn.push(event)
      }
    })

    // format for UI
    const myDripsIn = []
    currentUserDripsIn.forEach(event => {
      // multiple drips from same sender?
      const drips = event.args[2].filter(drip => drip[0].toLowerCase() === route.params.address)
      // add
      drips.map(drip => {
        myDripsIn.push({
          blockNumber: event.blockNumber,
          sender: event.args[0],
          receiver: [drip[0].toLowerCase()],
          amount: toDAIPerMo(drip[1])
        })
      })
    })
    // set
    dripsIn.value = myDripsIn
  } catch (e) {
    console.error(e)
  }
}

const getSplitsIn = async () => {
  try {
    const allSplitsEvents = await store.dispatch('getSplitsReceivers') || []
    // filter by user
    const userSplitsInEvents = allSplitsEvents.reverse().filter(event => {
      return event?.args[1].length && event.args[1].find(receiver => receiver[0].toLowerCase() === route.params.address)
    })

    // reduce to most recent update
    const currentUserSplitsIn = []
    userSplitsInEvents.forEach(event => {
      if (!currentUserSplitsIn.find(e => e.args[0] === event.args[0])) {
        currentUserSplitsIn.push(event)
      }
    })

    // format for UI
    const mySplitsIn = []
    currentUserSplitsIn.forEach(event => {
      const split = event.args[1].filter(row => row[0].toLowerCase() === route.params.address)
      split.forEach(split => {
        mySplitsIn.push({
          blockNumber: event.blockNumber,
          sender: event.args[0],
          receiver: [split[0].toLowerCase()],
          percent: split[1] / store.state.splitsFractionMax * 100
        })
      })
    })
    // set
    splitsIn.value = mySplitsIn
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => {
  getDripsIn()
  getSplitsIn()
})
</script>

<template lang="pug">
section.user-drips-in

  //- (loading bar)
  template(v-if="allDripsIn === undefined")
    loading-bar

  //-
  template(v-else)
    info-bar.mb-20.justify-center.px-32
      div
        | <b>{{ allDripsIn.length }} address{{ allDripsIn.length === 1 ? '' : 'es' }}</b>
        | {{ allDripsIn.length === 1 ? ' is ' : ' are ' }}
        | <b>dripping funds</b> to&nbsp;
        b(v-if="$store.getters.isWalletAddr($route.params.address)") you
        addr.font-bold(v-else, :address="$route.params.address")

    ul
      li(v-for="drip in allDripsIn")
        drip-row.my-2(:drip="drip", :alternateColors="true")

</template>
